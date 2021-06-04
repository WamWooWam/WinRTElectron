using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using Newtonsoft.Json.Linq;
using PriFormat;

namespace PriInfo
{
    class Program
    {
        static void Main(string[] args)
        {
            if (args.Length != 1)
            {
                Console.WriteLine("Usage: PriInfo <path to PRI file>");
                return;
            }

            var languages = new Dictionary<string, JObject>();

            using (FileStream stream = File.OpenRead(args[0]))
            {
                PriFile priFile = PriFile.Parse(stream);

                foreach (var resourceMapSectionRef in priFile.PriDescriptorSection.ResourceMapSections)
                {
                    ResourceMapSection resourceMapSection = priFile.GetSectionByRef(resourceMapSectionRef);

                    if (resourceMapSection.HierarchicalSchemaReference != null)
                        continue;

                    DecisionInfoSection decisionInfoSection = priFile.GetSectionByRef(resourceMapSection.DecisionInfoSection);

                    foreach (var candidateSet in resourceMapSection.CandidateSets.Values)
                    {
                        ResourceMapItem item = priFile.GetResourceMapItemByRef(candidateSet.ResourceMapItem);

                        Console.WriteLine("  {0}:", item.FullName);

                        foreach (var candidate in candidateSet.Candidates)
                        {
                            if (candidate.SourceFile != null)
                                continue;

                            string value = null;

                            var qualifierSet = decisionInfoSection.QualifierSets[candidate.QualifierSet];
                            //var language = qualifierSet.Qualifiers.FirstOrDefault(l => l.Type == QualifierType.Language)?.Value ?? qualifierSet.Qualifiers.FirstOrDefault(l => l.Type == QualifierType.Scale)?.Value ?? "generic";
                            //language = language.ToLowerInvariant();

                            var set = "generic";
                            var language = qualifierSet.Qualifiers.FirstOrDefault(l => l.Type == QualifierType.Language);
                            if (language != null)
                            {
                                set = language.Value.ToLowerInvariant();
                            }
                            else
                            {
                                var scale = qualifierSet.Qualifiers.FirstOrDefault(l => l.Type == QualifierType.Scale);
                                if (scale != null)
                                {
                                    set = $"scale-{scale.Value}";
                                }
                            }

                            var json = languages.TryGetValue(set, out var la) ? la : languages[set] = new JObject();
                            var keysArray = item.FullName.Split(new[] { '\\' }, StringSplitOptions.RemoveEmptyEntries);
                            var keys = keysArray.Take(keysArray.Length - 1);
                            if (!keys.Any())
                                keys = new[] { "generic" };

                            foreach (var key in keys)
                            {
                                json = json.TryGetValue(key, out var j) ? (JObject)j : (JObject)(json[key] = new JObject());
                            }

                            ByteSpan byteSpan;

                            if (candidate.DataItem != null)
                                byteSpan = priFile.GetDataItemByRef(candidate.DataItem.Value);
                            else
                                byteSpan = candidate.Data.Value;

                            stream.Seek(byteSpan.Offset, SeekOrigin.Begin);
                            byte[] data = new byte[byteSpan.Length];
                            stream.Read(data, 0, (int)byteSpan.Length);

                            switch (candidate.Type)
                            {
                                case ResourceValueType.AsciiPath:
                                case ResourceValueType.AsciiString:
                                    value = Encoding.ASCII.GetString(data).TrimEnd('\0');
                                    break;
                                case ResourceValueType.Utf8Path:
                                case ResourceValueType.Utf8String:
                                    value = Encoding.UTF8.GetString(data).TrimEnd('\0');
                                    break;
                                case ResourceValueType.Path:
                                case ResourceValueType.String:
                                    value = Encoding.Unicode.GetString(data).TrimEnd('\0');
                                    break;
                                case ResourceValueType.EmbeddedData:
                                    value = string.Format("<{0} bytes>", data.Length);
                                    break;
                            }

                            //var name = item.Name;
                            //if(scale != null && scale.Value != "100")
                            //{
                            //    name = Path.ChangeExtension(name, $".scale-{scale.Value}" + Path.GetExtension(name));
                            //}

                            json[item.Name] = value;

                            Console.WriteLine("    Candidate {0}: {1}", language, value);
                        }
                    }
                }
            }

            foreach (var lang in languages)
            {
                File.WriteAllText($"{lang.Key}.json", lang.Value.ToString());
            }
        }
    }
}
