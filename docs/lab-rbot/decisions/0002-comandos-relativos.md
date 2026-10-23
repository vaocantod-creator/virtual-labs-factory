# ADR-0002: Los comandos de Rbot son incrementos relativos fijos (sin estado acumulado compartido)

- **Estado:** ACEPTADA por instruccion del CEO (Victor) el 2026-10-22, para la **version web**. El alcance sobre el
  repo Java `vdiquez/Rbot` se resolvio en ADR-0003 (opcion a: Centro de Mando web; el repo Java no se modifica).
- **Laboratorio:** Rbot. **Reemplaza** la decision de conservar el comportamiento heredado (`ensamblado-y-paridad.md`, seccion 5).
- **Decide:** Arquitecto Heuristico propone; CEO aprueba (cambia logica core del simulador: gate de `docs/03-roadmap.md`).

## Contexto

El CEO pidio: *"una solicitud de cambio debe representar eso, y no debe ir en una direccion contraria al senalado por tener acumulado"*.
Es decir: un comando debe producir el cambio que su nombre indica, y no depender de lo que se ejecuto antes.

Evidencia medida con el codigo real de Rbot (oraculo Java, desplazamiento X del cuerpo):

| Secuencia | Resultado en Java (legado) | Lo esperado |
|---|---|---|
| `g` (avanzar) | **+1** (hacia atras) | -4 (hacia delante) |
| `ggg` | -7 | -12 |
| `h` (retroceder) | **+1** (hacia atras) | +4 |
| `gh` | **-3**: no vuelve, sigue hacia delante | 0 |
| `hg` | **+5**: no vuelve | 0 |
| `a` / `c` / `e` solos | la camara **no se mueve** (retraso de un paso) | se mueve |

Causa: `Cuerpo.avanzar()` y `retroceder()` comparten `paso` y `refX`, que **acumulan** el estado; cada comando mueve `paso - refX`, asi que
el efecto depende de la historia y el primer comando puede ir en sentido contrario al de su nombre. En la camara, cada comando aplica el
valor de referencia ANTES de actualizarlo (un paso de retraso).

## Decision

Cada comando es un **incremento relativo fijo**; su efecto no depende de los comandos anteriores:

| Comando | Efecto (modo mejorado) |
|---|---|
| `g` / `h` | trasladar el cuerpo 4 unidades hacia delante / atras (eje X local) |
| `i` / `j` | girar 4 grados a la derecha / izquierda |
| `a` / `b` | subir / bajar la cremallera 0,1 unidades |
| `c` / `d` | azimut +2 / -2 grados |
| `e` / `f` | elevacion +2 / -2 grados |

Las magnitudes son las del **regimen estable** de Java (lo que hacia cada comando a partir del segundo): 4 unidades equivalen a la
separacion entre eslabones de la oruga; 4 grados, al giro por paso; 0,1 / 2 / 2, a los pasos de los spinners.

Reglas:
1. **Reversibilidad:** un comando contrario deshace exactamente al anterior (`g` luego `h`, `i` luego `j`, `a`/`b`, `c`/`d`, `e`/`f`).
2. **Sin estado oculto:** el efecto de un comando no depende del historial.
3. **Sin retraso:** la camara reacciona al primer comando.
4. **Limites del Centro de Mando tambien en el receptor:** vertical -18..58 pasos, azimut +-45 pasos (+-90 grados), elevacion +-25 pasos (+-50 grados).
   Al saturar, el comando se ignora y el estado **no** acumula valores fuera de rango, asi que un comando contrario revierte un paso real.
5. **Estado como numero entero de pasos** (no como suma de reales): ir hasta el limite y volver pasa exactamente por el mismo estado, sin deriva de
   redondeo `float` (se detecto y corrigio durante la verificacion: 58 pasos de 0,1 sumados en `float` no llegaban a 5,8 exacto).
6. El **protocolo no cambia**: siguen siendo las letras `a`..`j` por UDP en 5555 y 8080 (invariante de la constitution). Lo que cambia es la
   **semantica**: cada letra es un incremento relativo, no una posicion absoluta ni un delta contra estado compartido.

El modo anterior se conserva como `modo: 'legado'` **solo** para la prueba de paridad con el oraculo Java.

## Verificacion (ejecutada)

- **103 propiedades, 0 fallos** (`prototypes/rbot-web/tools/propiedades.mjs`): reversibilidad de los 10 pares; independencia del historial
  (30 prefijos aleatorios); inversa de 30 secuencias aleatorias; magnitud lineal (1, 2, 3, 10 comandos); camara sin retraso; sentidos opuestos;
  conmutacion camara/cuerpo; saturacion en los tres limites y reversion desde el limite; 1000 comandos alternados vuelven al inicio sin deriva.
- **Control negativo:** las mismas 103 propiedades contra el modo legado fallan **85** veces: la prueba detecta el defecto que corrige.
- **No hay regresion de paridad:** el modo legado sigue dando 0 diferencias con Java en las 77 secuencias.
- **Comprobacion visual (pixeles):** `g`+`h` deja las 4 vistas identicas al inicio (0,00 % de pixeles distintos); `gggiii`+`jjjhhh` tambien.

Una aclaracion para no repetir un error que cometi al verificar: **retroceder no es el reverso de avanzar si el robot giro en medio.**
`gggiiihhhjjj` deja el robot a (X=-0,2622, Y=-2,4949), lo que la geometria predice exactamente; la inversa correcta es `gggiiijjjhhh`
(deshacer en orden inverso), que vuelve al origen con 0,0000.

## Consecuencias

- **Interoperabilidad mixta:** si el Entorno web (mejorado) retransmite comandos a un Centro de Mando **Java sin cambios** (legado), las dos
  escenas dejaran de coincidir, porque cada una interpreta el mismo comando con distinta semantica. Opciones: (a) portar tambien el Centro de Mando
  a la web (ya previsto en el ADR-0001); (b) usar el modo `legado` del Entorno web mientras convivan con el Centro de Mando Java; (c) aplicar el
  mismo cambio al repo Java. **Decision pendiente de Victor**: (c) toca su repo.
- **Rubrica PDD:** un comportamiento predecible y reversible es mas facil de evaluar; las rubricas se escriben contra el modo mejorado.
- **Compatibilidad con la tesis (2007):** el comportamiento original queda documentado y reproducible (`modo: 'legado'` + oraculo) por si hace
  falta citarlo como estado de partida.
- **No se cambia aqui** el movimiento de las orugas y las ruedas: sus maquinas de estado (29 eslabones, 15 posiciones) ya eran simetricas y
  reversibles; lo verifica la prueba (estados discretos incluidos).

## Lo que NO se verifico
- No se comparo el aspecto contra Java corriendo con pantalla; la comprobacion visual es entre capturas del propio prototipo.
- Las magnitudes (4 unidades, 4 grados) se eligieron como las del regimen estable de Java, no por una necesidad didactica; el profesor o Victor
  pueden querer otras (p. ej. pasos mas finos).
- No se evaluo todavia si 4 grados por giro resulta comodo para el estudiante.
