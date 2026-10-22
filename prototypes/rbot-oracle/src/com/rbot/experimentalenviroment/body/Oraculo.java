package com.rbot.experimentalenviroment.body;

import java.lang.reflect.Field;
import javax.media.j3d.Transform3D;
import javax.media.j3d.TransformGroup;
import com.rbot.experimentalenviroment.body.cam.EngranajeBaseMotor;
import com.rbot.experimentalenviroment.body.cam.EstructuraCamara;
import com.rbot.experimentalenviroment.body.cam.pieces.Camara;
import com.rbot.experimentalenviroment.body.cam.pieces.Cremallera;
import com.rbot.experimentalenviroment.body.cam.pieces.EngranajeElevador;

/**
 * ARNES DE ORACULO (fuera del repo de Victor, no lo modifica): ejecuta el codigo REAL de Rbot sobre `Cuerpo`
 * y `EstructuraCamara` y vuelca las matrices 4x4 de los TransformGroup, sin ventana ni OpenGL.
 * Replica el despacho de comandos de `EnvironmentReceiver.dispatch` (los acumuladores viven alli).
 */
public class Oraculo {
    static Object campo(Object o, String nombre) throws Exception {
        Class<?> c = o.getClass();
        while (c != null) {
            try {
                Field f = c.getDeclaredField(nombre);
                f.setAccessible(true);
                return f.get(o);
            } catch (NoSuchFieldException e) {
                c = c.getSuperclass();
            }
        }
        throw new NoSuchFieldException(nombre);
    }

    static String m(Object tgObj) {
        TransformGroup tg = (TransformGroup) tgObj;
        Transform3D t = new Transform3D();
        tg.getTransform(t);
        double[] v = new double[16];
        t.get(v);
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < 16; i++) {
            if (i > 0) sb.append(",");
            sb.append(Double.toString(v[i]));
        }
        return sb.append("]").toString();
    }

    /** Uso: Oraculo <archivo con una secuencia por linea; "-" = secuencia vacia>. Imprime un arreglo JSON. */
    public static void main(String[] args) throws Exception {
        java.util.List<String> lineas = java.nio.file.Files.readAllLines(java.nio.file.Paths.get(args[0]));
        StringBuilder todo = new StringBuilder("[");
        for (int i = 0; i < lineas.size(); i++) {
            String sec = lineas.get(i).trim();
            if (sec.equals("-")) sec = "";
            if (i > 0) todo.append(",");
            todo.append("{\"sec\":\"").append(sec).append("\",\"estado\":").append(ejecutar(sec)).append("}");
        }
        System.out.println(todo.append("]"));
    }

    static String ejecutar(String secuencia) throws Exception {
        Cuerpo c = new Cuerpo();
        EstructuraCamara ecm = c.getEstructuraCamara();
        Cremallera cre = ecm.getCremallera();
        Camara cam = cre.getCamara();
        EngranajeElevador ee = ecm.dameEngranajeElevador();
        EngranajeBaseMotor ebm = c.dameEngranajeBaseMotor();

        float refVertical = 0, refAzimut = 0, refElevacion = 0;
        for (char ch : secuencia.toCharArray()) {
            switch (ch) {
                case 'a': cre.rotarEjeZ(refVertical); ee.girarEjeY(refVertical); refVertical = refVertical + 0.1f; break;
                case 'b': cre.rotarEjeZ(refVertical); ee.girarEjeY(refVertical); refVertical = refVertical - 0.1f; break;
                case 'c': ecm.rotarEjeZ(refAzimut); ebm.girarEjeZ(-refAzimut); refAzimut = refAzimut + 2; break;
                case 'd': ecm.rotarEjeZ(refAzimut); ebm.girarEjeZ(-refAzimut); refAzimut = refAzimut - 2; break;
                case 'e': cam.rotarEjeY(refElevacion); refElevacion = refElevacion + 2; break;
                case 'f': cam.rotarEjeY(refElevacion); refElevacion = refElevacion - 2; break;
                case 'g': c.moverOrugaDerecha(); c.avanzar(); break;
                case 'h': c.moverOrugaIzquierda(); c.retroceder(); break;
                case 'i': c.moverDerecha(); c.derecha(); break;
                case 'j': c.moverIzquierda(); c.izquierda(); break;
                default: throw new IllegalArgumentException("comando " + ch);
            }
        }

        StringBuilder out = new StringBuilder("{");
        out.append("\"cuerpo\":").append(m(campo(c, "tg")));
        out.append(",\"ecmBase\":").append(m(campo(ecm, "tg")));
        out.append(",\"cremallera\":").append(m(campo(cre, "tg")));
        out.append(",\"camara\":").append(m(campo(cam, "tg")));
        out.append(",\"elevador\":").append(m(campo(ee, "tg")));
        out.append(",\"engranajeBase\":").append(m(campo(ebm, "tg")));
        out.append(",\"eslabonesDer\":[");
        java.util.List<?> l1 = (java.util.List<?>) campo(campo(c, "od"), "links");
        for (int i = 0; i < l1.size(); i++) out.append(i > 0 ? "," : "").append(campo(l1.get(i), "currentSlot"));
        out.append("],\"eslabonesIzq\":[");
        java.util.List<?> l2 = (java.util.List<?>) campo(campo(c, "od1"), "links");
        for (int i = 0; i < l2.size(); i++) out.append(i > 0 ? "," : "").append(campo(l2.get(i), "currentSlot"));
        out.append("],\"ruedas\":[");
        Object[] ws = (Object[]) campo(c, "wheels");
        for (int i = 0; i < ws.length; i++) out.append(i > 0 ? "," : "").append(campo(ws[i], "currentSlot"));
        out.append("]}");
        return out.toString();
    }
}
