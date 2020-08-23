using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Text;
using System.Threading.Tasks;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.Foundation.Metadata;
using Windows.Storage;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;

// The Blank Page item template is documented at https://go.microsoft.com/fwlink/?LinkId=402352&clcid=0x409

namespace StaticDumper
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class MainPage : Page
    {
        public MainPage()
        {
            this.InitializeComponent();
        }

        private async void Page_Loaded(object ass, RoutedEventArgs fuck)
        {
            var file = await ApplicationData.Current.TemporaryFolder.CreateFileAsync($"LibWrap.ts", CreationCollisionOption.ReplaceExisting);
            var writer = new StreamWriter(await file.OpenStreamForWriteAsync());

            var asm = typeof(LibWrap.WrSkyLib).Assembly;
            var dumper = new Dumper(asm, writer) { GetPropertyValues = true };
            await Task.Run(() => dumper.Dump());

            await Windows.System.Launcher.LaunchFileAsync(file);
        }


    }
}
