# laravel-filemanager
-   Install
    -   composer require semkeamsan/laravel-filemanager
    -   php artisan vendor:publish --tag=semkeamsan/laravel-filemanager-migration
    -   php artisan vendor:publish --tag=semkeamsan/laravel-filemanager-asset
    -   php artisan vendor:publish --tag=semkeamsan/laravel-filemanager-view
    -   php artisan vendor:publish --tag=semkeamsan/laravel-filemanager-config
    -   php artisan migrate
    -   php artisan storage:link
    -   php artisan serve

-   Edit env
    - FILEMANAGER_URL=filemanager

-   Edit web.php
    - use Semkeamsan\LaravelFilemanager\Filemanager;

        Route::group(['prefix' => '','middleware' => ['auth'] ], function () {
            Filemanager::routes();
        });

- http://127.0.0.1:8000/filemanager
- http://127.0.0.1:8000/filemanager/demo
    
