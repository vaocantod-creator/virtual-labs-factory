# Oraculo Java de Rbot (arnes de prueba)

Ejecuta el codigo REAL de `vdiquez/Rbot` (`Cuerpo`, `EstructuraCamara`, `Cremallera`, `Camara`, `EngranajeElevador`,
`EngranajeBaseMotor`) sobre una lista de secuencias de comandos y vuelca las matrices 4x4 de cada TransformGroup.
No modifica el repo de Victor: el arnes vive aqui y se compila con `-sourcepath` apuntando a el.

`oraculo-77-secuencias.json` es la salida de referencia para la prueba de paridad de `prototypes/rbot-web` (`npm run comparar`).

## Reproducir (Linux, sin pantalla fisica)
Requiere JDK 17 (compila con `--release 8`), Java3D 1.6.0 scijava + JOGL 2.3.2 + nativos `linux-amd64` desde Maven Central,
`libXtst.so.6` y un servidor X virtual:
```
Xvfb :99 -screen 0 1280x800x24 +extension GLX +render -noreset &
javac --release 8 -encoding windows-1252 -cp <jars>:loader/portfolio/portfolio.jar -sourcepath <Rbot>/src:src -d classes src/com/rbot/experimentalenviroment/body/Oraculo.java
DISPLAY=:99 java -Djava.awt.headless=false -Dj3d.rend=noop -cp classes:<jars>:... com.rbot.experimentalenviroment.body.Oraculo secuencias.txt
```
`-Dj3d.rend=noop` evita crear un contexto OpenGL (con el renderer real, Mesa/llvmpipe falla con SIGSEGV en este servidor).
El grafo de escena y las transformaciones SI se ejecutan; no se dibuja nada.
