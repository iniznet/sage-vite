<?php

namespace App\Assets;

use Roots\Acorn\Assets\Contracts\Bundle as BundleContract;
use Roots\Acorn\Assets\Manifest as AcornManifest;

class Manifest extends AcornManifest
{
    public function __construct(string $path, string $uri, array $assets = [], ?array $bundles = null)
    {
        $this->path = $path;
        $this->uri = $uri;
        $this->bundles = $this->rebundles($bundles);

        $assets = $this->getAssets($bundles);

        foreach ($assets as $original => $revved) {
            $this->assets[$this->normalizeRelativePath($original)] = $this->normalizeRelativePath($revved);
        }
    }

    /**
     * Get asset manifest. from bundles
     *
     * @return array
     */
    public function getAssets(?array $bundles = null): array
    {
        $bundles = $bundles ?? $this->bundles;
        $assets = [];

        foreach ($bundles as $bundleKey => $bundle) {
            if (str_starts_with($bundleKey, '_')) {
                continue;
            }

            if (str_ends_with($bundleKey, '.js') || str_ends_with($bundleKey, '.css')) {
                $bundleKeys = explode('/', $bundleKey);
                $bundleKey = end($bundleKeys);
            }

            $assets[$bundleKey] = $bundle['file'];
        }

        return $assets;
    }

    /**
     * Rebundles entrypoints to make compatible with Acorn's assets handler.
     *
     * @param array $bundles
     * @return array
     */
    public function rebundles(array $bundles): array
    {
        $rebundles = [];

        foreach ($bundles as $bundleKey => $bundle) {
            if (str_starts_with($bundleKey, '_') ||
                (!str_ends_with($bundleKey, '.js') && !str_ends_with($bundleKey, '.css'))) {
                continue;
            }

            $bundleKeys = explode('/', $bundleKey);
            $bundleKey = end($bundleKeys);
            $truncatedBundleKey = str_replace(['.js', '.css'], '', $bundleKey);

            if (str_starts_with($truncatedBundleKey, '_')) {
                continue;
            }

            if (!isset($rebundles[$truncatedBundleKey])) {
                $rebundles[$truncatedBundleKey] = [];
            }

            if (str_ends_with($bundleKey, '.js')) {
                $rebundles[$truncatedBundleKey]['js'] = [$bundle['file']];
            } else if (str_ends_with($bundleKey, '.css')) {
                $rebundles[$truncatedBundleKey]['css'] = [$bundle['file']];
            }
        }

        return $rebundles;
    }
}
