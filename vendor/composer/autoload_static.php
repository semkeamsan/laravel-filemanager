<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInitdf3d8a29daff27c2f12ea13975d7cbaa
{
    public static $prefixLengthsPsr4 = array (
        'S' => 
        array (
            'Semkeamsan\\LaravelFilemanager\\' => 30,
        ),
    );

    public static $prefixDirsPsr4 = array (
        'Semkeamsan\\LaravelFilemanager\\' => 
        array (
            0 => __DIR__ . '/../..' . '/src',
        ),
    );

    public static $classMap = array (
        'Composer\\InstalledVersions' => __DIR__ . '/..' . '/composer/InstalledVersions.php',
    );

    public static function getInitializer(ClassLoader $loader)
    {
        return \Closure::bind(function () use ($loader) {
            $loader->prefixLengthsPsr4 = ComposerStaticInitdf3d8a29daff27c2f12ea13975d7cbaa::$prefixLengthsPsr4;
            $loader->prefixDirsPsr4 = ComposerStaticInitdf3d8a29daff27c2f12ea13975d7cbaa::$prefixDirsPsr4;
            $loader->classMap = ComposerStaticInitdf3d8a29daff27c2f12ea13975d7cbaa::$classMap;

        }, null, ClassLoader::class);
    }
}
