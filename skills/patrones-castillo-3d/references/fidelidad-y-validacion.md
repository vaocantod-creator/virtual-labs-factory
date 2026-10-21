# Fidelidad al equipo real y validacion por experto

Criterios del articulo (aplican a labs que emulan un equipo/instrumento):
1. **Apariencia**: lo mas parecida posible a un equipo real, con diseno propio (sin marcas).
2. **Usabilidad**: botones, perillas, displays graficos como el equipo real; teclas multifuncion.
3. **Operacion**: comportamiento como equipo real.
4. **Modelo matematico**: salidas equivalentes (frecuencia, amplitud, forma de onda, etc.).
5. **Interoperabilidad**: equipos conectados en el mismo espacio funcionan juntos.

Protocolo de validacion:
- Modelo matematico validado primero en hoja de calculo (formulas + graficas), luego en test
  automatizado que compara salidas del lab contra valores de referencia (tolerancia en el spec).
- Validacion por experto tecnico (usabilidad, similitud, funcionalidad) con acta fechada en
  `docs/lab-<nombre>/validacion-experto.md`.
- Dos manuales de practica (operacion individual y simultanea) + manual de usuario por equipo.
- Configuraciones predefinidas de escena (equipo solo, par conectado, banco completo) como requisito UX.
- Complemento fabrica: PDD con estudiantes mide efectividad didactica (el articulo la considera no
  relevante para fidelidad; ambas se conservan, miden cosas distintas).
