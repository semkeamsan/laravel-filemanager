<?php

namespace Semkeamsan\LaravelFilemanager;

use Illuminate\Support\ServiceProvider;

class FilemangerServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap the application services.
     *
     * @return void
     */
    public function boot()
    {
        $this->loadTranslationsFrom(__DIR__.'/lang', 'semkeamsan/laravel-filemanager');
        $this->loadRoutesFrom(__DIR__ . '/routes.php');
        $this->loadMigrationsFrom(__DIR__ . '/migrations');
        $this->loadViewsFrom(__DIR__ . '/views', 'semkeamsan/laravel-filemanager');

        $this->publishes([
            __DIR__ . '/config/laravel-filemanager.php' => base_path('config/semkeamsan/laravel-filemanager.php'),
        ], 'semkeamsan/laravel-filemanager-config');

        $this->publishes([
            __DIR__.'/migrations' => base_path('database/migrations'),
        ], 'semkeamsan/laravel-filemanager-migration');

        $this->publishes([
            __DIR__.'/public' => public_path('vendor/semkeamsan/laravel-filemanager'),
        ], 'semkeamsan/laravel-filemanager-public');
        $this->publishes([
            __DIR__ . '/views' => base_path('resources/views/vendor/semkeamsan/filemanager'),
        ], 'semkeamsan/laravel-filemanager-view');

    }

    /**
     * Register the application services.
     *
     * @return void
     */
    public function register()
    {
        $this->mergeConfigFrom(__DIR__ . '/config/laravel-filemanager.php', 'filemanager-config');
    }
}
