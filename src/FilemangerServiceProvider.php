<?php

namespace Semkeamsan\LaravelFilemanager;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class FilemangerServiceProvider extends ServiceProvider
{
    public $path = 'semkeamsan/laravel-filemanager';
    /**
     * Bootstrap the application services.
     *
     * @return void
     */
    public function boot()
    {
        $this->mergeConfigFrom(__DIR__ . '/config/laravel-filemanager.php', 'filemanager-config');

        $this->loadTranslationsFrom(__DIR__ . '/lang',  $this->path );
        $this->loadRoutesFrom(__DIR__ . '/routes.php');
        $this->loadMigrationsFrom(__DIR__ . '/migrations');
        $this->loadViewsFrom(__DIR__ . '/views',  $this->path );

        $this->publishes([
            __DIR__ . '/config/laravel-filemanager.php' => base_path('config/' . $this->path . '.php'),
        ],  $this->path . '-config');

        $this->publishes([
            __DIR__ . '/migrations' => base_path('database/migrations'),
        ],  $this->path . '-migration');

        $this->publishes([
            __DIR__ . '/public' => public_path('vendor/' . $this->path ),
        ],  $this->path . '-asset');
        $this->publishes([
            __DIR__ . '/views' => base_path('resources/views/vendor/semkeamsan/filemanager'),
        ],  $this->path . '-view');

    }

    /**
     * Register the application services.
     *
     * @return void
     */
    public function register()
    {

        $style = '<link href="' . asset('vendor/' . $this->path . '/filemanager/filemanager.css') . '" rel="stylesheet">';
        $script =  '<script src="' . asset('vendor/' . $this->path . '/filemanager/filemanager.js') . '"></script>';
        $scriptLang = '<script src="' . asset('vendor/' . $this->path . '/filemanager/locales/' . app()->getLocale() . '.js') . '"></script>';


        Blade::directive('filemanagerStyle', function () use ($style) {
            return $style;
        });
        Blade::directive('filemanagerScript', function () use ($script) {
            return $script;
        });
        Blade::directive('filemanagerAssets', function () use ($style, $script) {
            return $style . $script;
        });
        Blade::directive('filemanagerScriptLang', function () use ($scriptLang) {
            return $scriptLang;
        });
    }

}
