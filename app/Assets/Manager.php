<?php

namespace App\Assets;

use Roots\Acorn\Assets\Contracts\Manifest as ManifestContract;
use Roots\Acorn\Assets\Manager as AcornManager;

class Manager extends AcornManager
{
    /**
     * Resolve the given manifest.
     *
     * @param  string  $name
     * @return ManifestContract
     *
     * @throws InvalidArgumentException
     */
    protected function resolve(string $name, ?array $config): ManifestContract
    {
        $config = $config ?? $this->getConfig($name);

        if (isset($config['handler'])) {
            return new $config['handler']($config);
        }

        $config = $this->pipeline($config);

        $path = $config['path'];
        $url = $config['url'];
        $bundles = isset($config['bundles']) ? $this->getJsonManifest($config['bundles']) : [];

        return new Manifest($path, $url, [], $bundles);
    }
}
