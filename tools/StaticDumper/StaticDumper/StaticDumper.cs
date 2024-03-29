﻿using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Numerics;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.Foundation.Metadata;
using Windows.UI;
using Windows.UI.Xaml;

namespace StaticDumper
{
    class Dumper
    {
        private Dictionary<Type, object> _cache
            = new Dictionary<Type, object>();

        struct ParameterEquality : IEqualityComparer<ParameterInfo>
        {
            public bool Equals(ParameterInfo x, ParameterInfo y) => x?.ParameterType == y?.ParameterType || x?.Name == y?.Name;
            public int GetHashCode(ParameterInfo obj) => obj.Name.GetHashCode();
        }

        // these identifiers are banned in typescript's strict mode
        private static string[] bannedIdentifiers = new[] {
            "function", "arguments"
        };

        // accessing properties on these types cause hard exceptions
        private static string[] bannedPropertyTypes = new[] {
            "SharingPackage", "SmartCardCryptogramMaterialCharacteristics", "CoreInkPresenterHost", "RenderTargetBitmap", "AccessKeyDisplayRequestedEventArgs"
        };

        // accessing these properties cause hard exceptions
        private static string[] bannedPropertyIdentifiers = new[] {
            "ParticipantContact",
        };

        private Assembly assembly;
        private Stack<string> stack;
        private TextWriter str;

        public Dumper(Assembly asm, TextWriter writer)
        {
            this.assembly = asm;
            this.stack = new Stack<string>();
            this.str = writer;
        }

        public bool GetFieldValues { get; set; } = true;
        public bool GetPropertyValues { get; set; } = true;
        public bool DoClasses { get; set; } = true;

        public void Dump()
        {
            var types = assembly.GetTypes().OrderBy(t => t.FullName).ToList();
            var ignoredMethods = new List<MethodInfo>();
            var ignoredTypes = new[]
            {
                typeof(Object), typeof(MarshalByRefObject), typeof(Delegate),
                Type.GetType("System.Runtime.InteropServices.WindowsRuntime.RuntimeClass, System.Private.CoreLib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=7cec85d7bea7798e")
            };

            foreach (var item in ignoredTypes)
            {
                ignoredMethods.AddRange(item.GetRuntimeMethods());
            }

            var includeedTypes = new[] {
                GetWinRTDefinedType("Windows.Foundation.Collections.IIterable`1"),
                GetWinRTDefinedType("Windows.Foundation.Collections.IVector`1"),
                GetWinRTDefinedType("Windows.Foundation.Collections.IVectorView`1"),
                GetWinRTDefinedType("Windows.Foundation.Collections.IKeyValuePair`2"),
                GetWinRTDefinedType("Windows.Foundation.Collections.IMap`2"),
                GetWinRTDefinedType("Windows.Foundation.Collections.IMapView`2")
            };


            var generationText = $"//     Generated from {Path.GetFileName(assembly.CodeBase)} version {assembly.GetName().Version} at {DateTime.Now}";

            str.Write("// ");
            str.WriteLine(Enumerable.Repeat('-', generationText.Length).ToArray());
            str.WriteLine("// <auto-generated> ");
            str.WriteLine("//     This code was generated by a tool.");
            str.WriteLine("//     ");
            str.WriteLine(generationText);
            str.WriteLine("// </auto-generated>");
            str.Write("// ");
            str.WriteLine(Enumerable.Repeat('-', generationText.Length).ToArray());


            object _unused = null;
            bool doClasses = DoClasses;
            foreach (var type in types)
            {
                var dict = new Dictionary<string, int>();
                var nameBits = type.FullName.Split('.', StringSplitOptions.RemoveEmptyEntries);
                nameBits = nameBits.Take(nameBits.Length - 1).ToArray();
                while (stack.Count > nameBits.Length)
                {
                    stack.Pop();
                    WritePop();
                }

                var i = Math.Min(nameBits.Length - 1, stack.Count - 1);
                for (; i >= 0; i--)
                {
                    var bit = nameBits[i];
                    if (stack.TryPeek(out var currentBit) && currentBit != bit)
                    {
                        stack.Pop();
                        WritePop();
                    }
                    else
                    {
                        break;
                    }
                }

                i = stack.Count;

                for (; i < nameBits.Length; i++)
                {
                    WriteWhitespace(stack.Count);
                    str.WriteLine($"export namespace {nameBits[i]} {{ ");
                    stack.Push(nameBits[i]);
                }

                if (type.IsEnum)
                {
                    WriteWhitespace(stack.Count);
                    str.WriteLine($"export enum {type.Name} {{");

                    long num = 0;
                    var fields = type.GetFields().Skip(1);
                    foreach (var field in fields)
                    {
                        var writeNum = false;
                        var value = Convert.ToInt64(field.GetValue(null));
                        var name = FixCasing(field.Name);

                        if (num != value)
                        {
                            num = value;
                            writeNum = true;
                        }

                        WriteWhitespace(stack.Count + 1);
                        str.Write(name);

                        if (writeNum)
                        {
                            str.Write(" = ");
                            str.Write(num);
                        }

                        str.WriteLine(",");

                        num++;
                    }

                    WriteWhitespace(stack.Count);
                    str.WriteLine("}");
                }
                else if (typeof(Delegate).IsAssignableFrom(type))
                {
                    WriteWhitespace(stack.Count);
                    str.Write($"export type {GetContextAwareTypeName(type)} = (");
                    var invoke = type.GetMethod("Invoke");
                    IEnumerable<ParameterInfo> parameterInfo = Array.Empty<ParameterInfo>();
                    if (invoke != null)
                    {
                        parameterInfo = invoke.GetParameters().Skip(1);
                        WriteParameterList(parameterInfo);
                    }

                    str.Write(") => ");
                    str.Write(GetTypeScriptReturnType(invoke?.ReturnType ?? typeof(void), parameterInfo.Where(t => t.IsOut && !t.ParameterType.IsArray), out _));
                    str.WriteLine(";");
                }
                else if (type.IsInterface && doClasses)
                {
                    if (!includeedTypes.Contains(type) && !type.IsVisible)
                        continue;

                    WriteWhitespace(stack.Count);
                    str.Write($"export interface {GetContextAwareTypeName(type)} ");
                    WriteInterfaceList(type);
                    str.WriteLine("{");

                    var properties = type.GetRuntimeProperties();
                    foreach (var prop in properties)
                    {
                        WriteProperty(type, ref _unused, false, prop, true);
                    }

                    var methods = type.GetRuntimeMethods().Where(t => !ignoredMethods.Any(y => t.Name == y.Name)).OrderBy(m => m.MetadataToken).OrderBy(m => m.IsStatic ? 1 : 0);
                    foreach (var method in methods)
                    {
                        WriteMethod(type, dict, method, true);
                    }

                    WriteWhitespace(stack.Count);
                    str.WriteLine("}");
                }
                else if (type.IsValueType && !type.IsPrimitive)
                {
                    WriteWhitespace(stack.Count);
                    var structName = GetContextAwareTypeName(type);
                    // Debug.WriteLine(interfaceName);
                    str.WriteLine($"export interface {structName} {{");
                    var fields = type.GetRuntimeFields();

                    foreach (var field in fields)
                    {
                        WriteField(type, ref _unused, field, true);
                    }
                    WriteWhitespace(stack.Count);
                    str.WriteLine("}");

                }
                else if (type.IsClass && doClasses)
                {
                    WriteWhitespace(stack.Count);
                    var className = GetContextAwareTypeName(type);
                    // Debug.WriteLine(className);
                    str.Write($"export class {className} ");

                    WriteInterfaceList(type);

                    str.WriteLine("{");


                    var ctors = type.GetConstructors();
                    foreach (var ctor in ctors)
                    {
                        WriteWhitespace(stack.Count + 1);
                        str.Write("// constructor(");
                        WriteParameterList(ctor.GetParameters());
                        str.WriteLine(");");
                    }

                    var ctorParams = ctors.SelectMany(c => c.GetParameters()).Distinct(new ParameterEquality()).ToList();
                    if (ctorParams.Any())
                    {
                        WriteWhitespace(stack.Count + 1);
                        str.Write("constructor(");
                        WriteParameterList(ctorParams);
                        str.WriteLine(") {}");
                        str.WriteLine();
                    }

                    var canCreateInstance = type.GetConstructors().Any(t => t.GetParameters().Length == 0);
                    var properties = type.GetRuntimeProperties();
                    object instance = null;
                    if (properties.Any())
                    {
                        foreach (var prop in properties)
                        {
                            WriteProperty(type, ref instance, canCreateInstance, prop);
                        }

                        str.WriteLine();
                    }

                    var fields = type.GetRuntimeFields();
                    if (fields.Any())
                    {
                        foreach (var field in fields)
                        {
                            WriteField(type, ref instance, field);
                        }
                    }

                    var methods = type.GetRuntimeMethods().Where(t => !ignoredMethods.Any(y => t.Name == y.Name)).OrderBy(m => m.MetadataToken).OrderBy(m => m.IsStatic ? 1 : 0);
                    foreach (var method in methods)
                    {
                        WriteMethod(type, dict, method);
                    }

                    var events = type.GetEvents();
                    if (events.Any())
                    {
                        var staticEvents = events.Where(e => e.AddMethod.IsStatic);
                        var instanceEvents = events.Where(e => !e.AddMethod.IsStatic);

                        if (staticEvents.Any())
                        {
                            WriteWhitespace(stack.Count + 1);
                            str.Write("static ");
                            WriteAddEventListenerMethod(type, staticEvents);
                            str.WriteLine();

                            WriteWhitespace(stack.Count + 1);
                            str.WriteLine("}");
                        }

                        if (instanceEvents.Any())
                        {
                            WriteWhitespace(stack.Count + 1);
                            WriteAddEventListenerMethod(type, instanceEvents);
                            str.WriteLine();

                            WriteWhitespace(stack.Count + 1);
                            str.WriteLine("}");
                        }
                    }

                    WriteWhitespace(stack.Count);
                    str.WriteLine("}");
                }
            }

            while (stack.TryPop(out _))
            {
                WritePop();
            }

            str.Flush();
        }

        private object WriteField(Type type, ref object instance, FieldInfo field, bool isStructDefinition = false)
        {
            var name = FixCasing(field.Name);
            var isStatic = field.IsStatic;

            object val = null;
            if (GetFieldValues && !bannedPropertyTypes.Contains(type.Name)) // dirty hack to avoid hard exceptions
            {
                try
                {
                    if (!isStatic)
                    {
                        instance = instance ?? Activator.CreateInstance(type);
                        val = field.GetValue(instance);
                    }
                    else
                    {
                        val = field.GetValue(null);
                    }
                }
                catch { };
            }

            WriteWhitespace(stack.Count + 1);
            //if (field.IsPublic)
            //    str.Write("public ");
            //if (field.IsPrivate)
            //    str.Write("private ");
            if (isStatic)
                str.Write("static ");
            str.Write(name);
            str.Write(": ");
            str.Write(GetTypeScriptTypeName(field.FieldType));

            if (val != null)
            {
                str.Write(" = ");
                str.Write(GetTypeScriptValue(val, field.FieldType));
            }

            str.WriteLine(";");
            return instance;
        }

        private object WriteProperty(Type type, ref object instance, bool canCreateInstance, PropertyInfo prop, bool isInterfaceDefinition = false)
        {
            var name = FixCasing(prop.Name);
            var isStatic = (prop.GetMethod?.IsStatic ?? false) || (prop.SetMethod?.IsStatic ?? false);

            object val = null;

            if (!isInterfaceDefinition && GetPropertyValues && !bannedPropertyTypes.Contains(type.Name) && !bannedPropertyIdentifiers.Contains(prop.Name) && prop.GetMethod != null) // dirty hack to avoid hard exceptions
            {
                try
                {
                    if (!isStatic)
                    {
                        if (canCreateInstance)
                        {
                            instance = instance ?? Activator.CreateInstance(type);
                            val = prop.GetValue(instance);
                        }

                        if (instance == null)
                        {
                            if (_cache.TryGetValue(type, out instance))
                            {
                                Debug.WriteLine($"instance from cache {type}");
                                val = prop.GetValue(instance);
                            }
                        }
                    }
                    else
                    {
                        val = prop.GetValue(null);
                    }
                }
                catch { };
            }

            WriteWhitespace(stack.Count + 1);

            //if (!isInterfaceDefinition)
            //{
            //    if ((prop.GetMethod?.IsPublic ?? false) || (prop.SetMethod?.IsPublic ?? false))
            //        str.Write("public ");
            //    else if ((prop.GetMethod?.IsPrivate ?? false) || (prop.SetMethod?.IsPrivate ?? false))
            //        str.Write("private ");
            //}

            if (isStatic)
                str.Write("static ");

            if (prop.GetMethod != null && prop.SetMethod == null)
                str.Write("readonly ");

            str.Write(name);
            str.Write(": ");

            str.Write(GetTypeScriptTypeName(prop.PropertyType));

            if (val != null && !isInterfaceDefinition)
            {
                str.Write(" = ");
                str.Write(GetTypeScriptValue(val, prop.PropertyType));
            }

            str.WriteLine(";");
            return instance;
        }

        private void WriteMethod(Type type, Dictionary<string, int> dict, MethodInfo method, bool isInterfaceDefinition = false)
        {
            var methodName = method.Name;
            if (methodName.StartsWith("get_") || methodName.StartsWith("put_") || methodName.StartsWith("set_") || methodName.StartsWith("add_") || methodName.StartsWith("remove_"))
                return; // we dont wanna write property fe

            if (methodName == "Dispose")
                methodName = "Close";

            dict[methodName] = (dict.TryGetValue(methodName, out var x) ? x : -1) + 1;

            var y = dict[methodName];
            var overload = method.GetCustomAttributes().FirstOrDefault(t => t is OverloadAttribute);
            if (overload != null && overload is OverloadAttribute a)
            {
                methodName = a.ToString();
            }

            methodName = FixCasing(methodName);
            if (y != 0)
            {
                methodName += $"_{y}";
            }

            WriteWhitespace(stack.Count + 1);

            //if (!isInterfaceDefinition)
            //{
            //    if (method.IsPrivate && !method.IsVirtual)
            //        str.Write("private ");
            //}

            if (method.IsStatic)
                str.Write("static ");

            str.Write(methodName);

            if (method.IsGenericMethod)
            {
                str.Write("<");
                var genericParams = method.GetGenericArguments();

                for (int z = 0; z < genericParams.Length; z++)
                {
                    var typeParamName = GetTypeScriptTypeName(genericParams[z]);
                    str.Write(z == 0 ? typeParamName : "," + typeParamName);

                }

                str.Write(">");
            }

            str.Write("(");

            var parameterInfo = method.GetParameters();
            var shouldThrow = false;
            WriteParameterList(parameterInfo);

            str.Write("): ");
            str.Write(GetTypeScriptReturnType(method.ReturnType, parameterInfo.Where(p => p.IsOut && !p.ParameterType.IsArray), out shouldThrow));

            if (!isInterfaceDefinition)
            {
                str.WriteLine(" {");
                WriteWhitespace(stack.Count + 2);
                if (shouldThrow)
                    str.WriteLine($"throw new Error('shimmed function {type.Name}.{methodName}');");
                else
                    str.WriteLine($"console.warn('shimmed function {type.Name}.{methodName}');");
                WriteWhitespace(stack.Count + 1);
                str.WriteLine("}");
                str.WriteLine();
            }
            else
            {
                str.WriteLine(";");
            }
        }

        private void WriteInterfaceList(Type type)
        {
            var interfaces = type.GetInterfaces().Where(i => !i.IsPrimitive).Select(iface => GetTypeScriptTypeName(iface, true)).Where(n => !n.StartsWith("/*")).ToArray();
            if (interfaces.Any())
            {
                str.Write(type.IsInterface ? "extends " : "implements ");
                for (int j = 0; j < interfaces.Length; j++)
                {
                    var iface = interfaces[j];

                    str.Write(iface);

                    if (j != interfaces.Length - 1)
                        str.Write(", ");
                    else
                        str.Write(" ");
                }
            }
        }

        private void WriteParameterList(IEnumerable<ParameterInfo> parameterInfo)
        {
            foreach (var param in parameterInfo)
            {
                if (param.IsOut && !param.ParameterType.IsArray)
                    continue;

                str.Write(FixCasing(param.Name));
                str.Write(": ");
                str.Write(GetTypeScriptTypeName(param.ParameterType));
                if (parameterInfo.Last(p => !(p.IsOut && !p.ParameterType.IsArray)) != param)
                    str.Write(", ");
            }
        }

        public string GetTypeScriptReturnType(Type t, IEnumerable<ParameterInfo> outParams, out bool shouldThrow)
        {
            var count = outParams.Count();
            if (count == 0)
            {
                shouldThrow = t != typeof(void);
                return GetTypeScriptTypeName(t);
            }

            if (count == 1 && t == typeof(void))
            {
                shouldThrow = true;
                return GetTypeScriptTypeName(outParams.First().ParameterType);
            }

            shouldThrow = true;
            var list = new List<(string name, Type type)>();
            var builder = new StringBuilder();
            builder.Append("{ ");

            if (t != typeof(void))
            {
                list.Add(("returnValue", t));
            }

            foreach (var item in outParams)
            {
                list.Add((item.Name, item.ParameterType.GetElementType()));
            }

            for (int i = 0; i < list.Count; i++)
            {
                var item = list[i];
                builder.Append(item.name)
                       .Append(": ")
                       .Append(GetTypeScriptTypeName(item.type));

                if (i != list.Count - 1)
                    builder.Append(", ");
            }

            builder.Append(" }");

            return builder.ToString();
        }

        private string GetTypeScriptTypeName(Type t, bool isInherited = false)
        {
            t = UnprojectWinRTType(t);

            if (t.IsGenericParameter)
                return t.Name;

            if (t.IsEnum)
            {
                return GetContextAwareTypeName(t);
            }

            if (!isInherited)
            {
                if (t.IsArray)
                    return $"{GetTypeScriptTypeName(t.GetElementType(), false)}[]";

                if (t == typeof(void))
                    return "void";

                if (t == typeof(object))
                    return "any";

                if (t == typeof(bool))
                    return "Boolean";

                if (t == typeof(string) || t == typeof(char) || t == typeof(Guid))
                    return "string";

                if (t == typeof(float) || t == typeof(double) || t == typeof(TimeSpan) ||
                    t == typeof(byte) || t == typeof(short) || t == typeof(int) || t == typeof(long) ||
                    t == typeof(sbyte) || t == typeof(ushort) || t == typeof(uint) || t == typeof(ulong))
                    return "number";

                if (t == typeof(DateTime) || t == typeof(DateTimeOffset))
                    return "Date";

                if (t == typeof(Exception) || typeof(Exception).IsAssignableFrom(t))
                    return "number"; // HRESULT innit

                if (t.IsGenericType)
                {
                    var t1 = t.GetGenericTypeDefinition();
                    if (t1 == typeof(IDictionary<,>))
                    {
                        var args = t.GetGenericArguments();
                        return $"Map<{GetTypeScriptTypeName(args[0])},{GetTypeScriptTypeName(args[1])}>";
                    }

                    if (typeof(IEnumerable).IsAssignableFrom(t1) || t1 == typeof(IList<>) || t1 == typeof(IEnumerable<>) || t1 == typeof(IReadOnlyList<>))
                    {
                        var args = t.GetGenericArguments();
                        return isInherited ? $"{t.Name.Substring(0, t.Name.IndexOf('`'))}<{GetTypeScriptTypeName(args[0])}>" : $"{GetTypeScriptTypeName(args[0])}[]";
                    }

                    if (t1 == typeof(Nullable<>))
                    {
                        var args = t.GetGenericArguments();
                        return $"{GetTypeScriptTypeName(args[0])} | null";
                    }
                }

                if (t.IsByRef)
                {
                    if (t.IsArray)
                    {
                        return $"{GetTypeScriptTypeName(t.GetElementType(), false)}[]";
                    }
                    else
                    {
                        return GetTypeScriptTypeName(t.GetElementType(), isInherited);
                    }
                }
            }


            if (t.Assembly == assembly || t.Assembly.FullName == "Windows, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime")
            {
                return GetContextAwareTypeName(t);
            }

            var name = t.FullName ?? t.Name;

            return isInherited ? $"/* {name} */" : $"/* {name} */ any";
        }

        private Type GetWinRTDefinedType(string name)
             => Type.GetType($"{name}, Windows, Version=255.255.255.255, Culture=neutral, PublicKeyToken=null, ContentType=WindowsRuntime");

        private Type CreateWinRTGenericType(string name, Type t)
        {
            var baseT = GetWinRTDefinedType(name);
            return baseT.MakeGenericType(t.GenericTypeArguments);
        }

        private Type UnprojectWinRTType(Type t)
        {
            // hardcoded (probably incomplete) list of types projected differently in .NET
            // Windows.Foundation
            if (t == typeof(IDisposable))
                t = GetWinRTDefinedType("Windows.Foundation.IClosable");
            if (t == typeof(Uri))
                t = GetWinRTDefinedType("Windows.Foundation.Uri");
            if (t == typeof(Point))
                t = GetWinRTDefinedType("Windows.Foundation.Point");
            if (t == typeof(Size))
                t = GetWinRTDefinedType("Windows.Foundation.Size");
            if (t == typeof(Rect))
                t = GetWinRTDefinedType("Windows.Foundation.Rect");

            // Windows.Foundation.Numerics
            if (t == typeof(Matrix3x2))
                t = GetWinRTDefinedType("Windows.Foundation.Numerics.Matrix3x2");
            if (t == typeof(Matrix4x4))
                t = GetWinRTDefinedType("Windows.Foundation.Numerics.Matrix4x4");
            if (t == typeof(Plane))
                t = GetWinRTDefinedType("Windows.Foundation.Numerics.Plane");
            if (t == typeof(Quaternion))
                t = GetWinRTDefinedType("Windows.Foundation.Numerics.Quaternion");
            if (t == typeof(Vector2))
                t = GetWinRTDefinedType("Windows.Foundation.Numerics.Vector2");
            if (t == typeof(Vector3))
                t = GetWinRTDefinedType("Windows.Foundation.Numerics.Vector3");
            if (t == typeof(Vector4))
                t = GetWinRTDefinedType("Windows.Foundation.Numerics.Vector4");

            if (t.IsGenericType)
            {
                var genericDefinition = t.GetGenericTypeDefinition();
                // Windows.Foundation.Collections
                if (genericDefinition == typeof(IEnumerable<>))
                    t = CreateWinRTGenericType("Windows.Foundation.Collections.IIterable`1", t);
                if (genericDefinition == typeof(IList<>))
                    t = CreateWinRTGenericType("Windows.Foundation.Collections.IVector`1", t);
                if (genericDefinition == typeof(IReadOnlyList<>))
                    t = CreateWinRTGenericType("Windows.Foundation.Collections.IVectorView`1", t);
                if (genericDefinition == typeof(KeyValuePair<,>))
                    t = CreateWinRTGenericType("Windows.Foundation.Collections.IKeyValuePair`2", t);
                if (genericDefinition == typeof(IDictionary<,>))
                    t = CreateWinRTGenericType("Windows.Foundation.Collections.IMap`2", t);
                if (genericDefinition == typeof(IReadOnlyDictionary<,>))
                    t = CreateWinRTGenericType("Windows.Foundation.Collections.IMapView`2", t);
            }

            // Windows.UI
            if (t == typeof(Color))
                t = GetWinRTDefinedType("Windows.UI.Color");

            // Windows.UI.Xaml
            if (t == typeof(Thickness))
                t = GetWinRTDefinedType("Windows.UI.Xaml.Thickness");
            if (t == typeof(CornerRadius))
                t = GetWinRTDefinedType("Windows.UI.Xaml.CornerRadius");

            return t;
        }

        private string GetContextAwareTypeName(Type t)
        {
            var name = GetSanitisedName(t, true);
            var append = "";
            if (name.Contains('<'))
            {
                append = name.Substring(name.IndexOf('<'));
                name = name.Substring(0, name.IndexOf('<'));
            }

            var n = name.Split('.').ToArray();
            var s = stack.Reverse().ToArray();
            var i = 0;
            while (n[i] == s.ElementAtOrDefault(i))
                i++;

            return string.Join('.', n.Skip(i)) + append;
        }

        private string GetTypeScriptValue(object obj, Type t)
        {
            if (t.IsEnum)
            {
                var name = Enum.GetName(t, obj);
                if (name != null)
                {
                    return $"{t.Name}.{FixCasing(name)}";
                }

                return obj.ToString();
            }

            if (t == typeof(bool))
            {
                return (bool)obj ? "true" : "false";
            }

            if (t == typeof(string) || t == typeof(char) || t == typeof(Guid) || obj is string)
            {
                return $"'{obj.ToString().Replace("'", "\'")}'";
            }

            if (t == typeof(float) || t == typeof(double) ||
                t == typeof(byte) || t == typeof(short) || t == typeof(int) || t == typeof(long) ||
                t == typeof(sbyte) || t == typeof(ushort) || t == typeof(uint) || t == typeof(ulong))
            {
                return obj.ToString();
            }

            if (t == typeof(TimeSpan))
            {
                return ((TimeSpan)obj).TotalMilliseconds.ToString();
            }

            if (t == typeof(DateTime))
            {
                return $"new Date({((DateTime)obj).Subtract(new DateTime(1970, 1, 1)).TotalMilliseconds})";
            }

            if (t == typeof(DateTimeOffset))
            {
                return $"new Date({((DateTimeOffset)obj).Subtract(new DateTime(1970, 1, 1)).TotalMilliseconds})";
            }

            if (t == typeof(Color))
            {
                var col = (Color)obj;
                return $"{{ a: {col.A}, r: {col.R}, g: {col.G}, b: {col.B} }}";
            }

            if (t == typeof(Rect))
            {
                var r = (Rect)obj;
                return $"{{ x: {r.X}, y: {r.Y}, width: {r.Width}, height: {r.Height} }}";
            }

            if (t == typeof(Size))
            {
                var s = (Size)obj;
                return $"{{ width: {s.Width}, height: {s.Height} }}";
            }

            if (t == typeof(Uri))
            {
                var uri = (Uri)obj;
                return $"new Uri('{uri}')";
            }

            try
            {
                if (obj is IEnumerable e)
                {
                    var str = string.Join(", ", e.OfType<object>().Select(s => GetTypeScriptValue(s, s.GetType())));
                    return $"[ {str} ]";
                }
            }
            catch
            {

            }

            Debug.WriteLine(t);

            if (obj != null)
                _cache[obj.GetType()] = obj;

            return "null";
        }

        private void WriteAddEventListenerMethod(Type type, IEnumerable<EventInfo> events)
        {
            var count = stack.Count;

            str.WriteLine("addEventListener(name: string, handler: Function) {");
            WriteWhitespace(count + 2);
            str.WriteLine($"console.warn(`{type.Name}::addEventListener: ${{name}}`);");
            WriteWhitespace(count + 2);
            str.WriteLine("switch (name) {");
            foreach (var ev in events)
            {
                WriteWhitespace(count + 3);
                str.WriteLine($"case \"{ev.Name.ToLowerInvariant()}\": // {GetTypeScriptTypeName(ev.EventHandlerType)}");
            }

            WriteWhitespace(count + 4);
            str.WriteLine($"break;");
            WriteWhitespace(count + 2);
            str.WriteLine("}");

            //WriteWhitespace(count + 2);
            //str.WriteLine("}");
        }

        private string FixCasing(string name)
        {
            if (char.IsUpper(name[0]))
            {
                var toLower = new String(name.TakeWhile(c => char.IsUpper(c) && c != '_').ToArray()).ToLower();
                name = name.Remove(0, toLower.Length);
                name = toLower + name;
            }

            if (bannedIdentifiers.Contains(name))
            {
                return "__" + name;
            }

            return name;
        }

        private void WriteWhitespace(int depth)
        {
            for (int j = 0; j < depth * 4; j++)
                str.Write(' ');
        }

        private void WritePop()
        {
            WriteWhitespace(stack.Count);
            str.WriteLine("}");
        }

        private string GetSanitisedName(Type t, bool full = false)
        {
            if (t.IsGenericType)
            {
                var friendlyName = full ? t.FullName ?? t.Name : t.Name;
                var iBacktick = friendlyName.IndexOf('`');
                if (iBacktick > 0)
                {
                    friendlyName = friendlyName.Remove(iBacktick);
                }
                friendlyName += "<";
                var typeParameters = t.GetGenericArguments();
                for (var i = 0; i < typeParameters.Length; ++i)
                {
                    var typeParamName = GetTypeScriptTypeName(typeParameters[i]);
                    friendlyName += (i == 0 ? typeParamName : "," + typeParamName);
                }
                friendlyName += ">";
                return friendlyName;
            }
            else
            {
                return full ? (t.FullName ?? t.Name) : (t.Name ?? t.FullName);
            }
        }
    }

}
