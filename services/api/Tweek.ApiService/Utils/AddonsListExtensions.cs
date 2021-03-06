﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyModel;
using Tweek.ApiService.Addons;

namespace Tweek.ApiService.Utils
{
    public static class AddonsListExtensions
    {
        public static void InstallAddons(this IApplicationBuilder app, IConfiguration configuration)
        {
            ForEachAddon(configuration, addon => addon.Use(app, configuration));
        }

        public static void RegisterAddonServices(this IServiceCollection services, IConfiguration configuration)
        {
            ForEachAddon(configuration, addon => addon.Configure(services, configuration));
        }

        private static void ForEachAddon(IConfiguration configuration, Action<ITweekAddon> action)
        {
            foreach (var tweekAddon in GetAddons(configuration))
            {
                action(tweekAddon);
            }
        }

        private static IEnumerable<ITweekAddon> _addonsCache;

        private static IEnumerable<ITweekAddon> GetAddons(IConfiguration configuration)
        {
            if (_addonsCache != null) return _addonsCache;

            var addonConfiguration = configuration.GetSection("Addons");

            var selectedAddons = new HashSet<string>(
                configuration.GetSection("UseAddon")
                    .GetChildren()
                    .SelectMany(x => x.Value.Split(';'))
                    .Select(x => x.Trim())
                    .Where(x => !string.IsNullOrEmpty(x))
                    .Select(addon => addonConfiguration.GetSection(addon))
                    .Select(x => Assembly.CreateQualifiedName(x["AssemblyName"], x["ClassName"]))
            );

            _addonsCache = GetSelectedAddons(selectedAddons);

            return _addonsCache;
        }

        public static IEnumerable<ITweekAddon> GetSelectedAddons(HashSet<string> selectedAddons)
        {
            var assemblies = GetRuntimeAssemblies();

            var addonTypes = GetAddonTypeFromAssemblies(assemblies);

            return InstantiateSelectedAddonTypes(addonTypes, selectedAddons);
        }

        private static IEnumerable<Assembly> GetRuntimeAssemblies()
        {
            var dependencies = DependencyContext.Default.RuntimeLibraries;

            return dependencies.SelectMany(library =>
                library.GetDefaultAssemblyNames(DependencyContext.Default).Select(Assembly.Load));
        }

        private static IEnumerable<Type> GetAddonTypeFromAssemblies(IEnumerable<Assembly> assemblies)
        {
            return assemblies.Bind(x => x.GetExportedTypes())
                .Filter(x => x != typeof(ITweekAddon) && typeof(ITweekAddon).IsAssignableFrom(x));
        }

        private static IEnumerable<ITweekAddon> InstantiateSelectedAddonTypes(IEnumerable<Type> addonTypes, HashSet<string> selectedAddons)
        {
            return addonTypes
                .Filter(type => selectedAddons.Contains(type.AssemblyQualifiedNameWithoutVersion()))
                .Map(t => (ITweekAddon) Activator.CreateInstance(t));
        }

        private static string AssemblyQualifiedNameWithoutVersion(this Type type) =>
            Assembly.CreateQualifiedName(type.GetTypeInfo().Assembly.GetName().Name, type.FullName);
    }
}