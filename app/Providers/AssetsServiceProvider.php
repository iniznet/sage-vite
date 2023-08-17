<?php

namespace App\Providers;

use App\Assets\Manager;
use Roots\Acorn\Assets\AssetsServiceProvider as AcornAssetsServiceProvider;

class AssetsServiceProvider extends AcornAssetsServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->singleton('assets', function () {
            return new Manager($this->app->make('config')->get('assets'));
        });

        $this->app->singleton('assets.manifest', function ($app) {
            return $app['assets']->manifest($this->getDefaultManifest());
        });

        $this->app->alias('assets.manifest', \App\Assets\Manifest::class);
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        // ...
    }
}
