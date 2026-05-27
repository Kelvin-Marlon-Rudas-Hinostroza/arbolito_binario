import weka.core.Attribute;
import weka.core.DenseInstance;
import weka.core.Instances;

import java.util.ArrayList;
import java.util.Scanner;

public class ArbolBinario {

    // ==================================================
    // 1. NODO DEL ÁRBOL
    // ==================================================
    static class Nodo {
        int valor;
        Nodo izquierdo;
        Nodo derecho;

        Nodo(int valor) {
            this.valor = valor;
        }
    }

    // ==================================================
    // 2. RESULTADOS AUXILIARES
    // ==================================================
    static class ResultadoBusqueda {
        boolean encontrado;
        int pasos;
        String ruta;

        ResultadoBusqueda(boolean encontrado, int pasos, String ruta) {
            this.encontrado = encontrado;
            this.pasos = pasos;
            this.ruta = ruta;
        }
    }

    static class ResultadoRecorrido {
        String valores;
        int pasos;

        ResultadoRecorrido(String valores, int pasos) {
            this.valores = valores;
            this.pasos = pasos;
        }
    }

    static class Contador {
        int pasos = 0;
    }

    // ==================================================
    // 3. CLASE DEL ÁRBOL BST
    // ==================================================
    static class ArbolBST {
        Nodo raiz;

        // ------------------------------------------
        // INSERTAR
        // ------------------------------------------
        Nodo insertar(Nodo nodo, int valor) {
            if (nodo == null) return new Nodo(valor);

            if (valor < nodo.valor) {
                nodo.izquierdo = insertar(nodo.izquierdo, valor);
            } else if (valor > nodo.valor) {
                nodo.derecho = insertar(nodo.derecho, valor);
            } else {
                System.out.println("  [!] El valor " + valor + " ya existe.");
            }
            return nodo;
        }

        // ------------------------------------------
        // BUSCAR
        // ------------------------------------------
        ResultadoBusqueda buscar(Nodo nodo, int valor) {
            StringBuilder ruta = new StringBuilder();
            int pasos = 0;

            while (nodo != null) {
                pasos++;
                ruta.append(nodo.valor).append(" ");

                if (valor == nodo.valor) {
                    return new ResultadoBusqueda(true, pasos, ruta.toString().trim());
                } else if (valor < nodo.valor) {
                    nodo = nodo.izquierdo;
                } else {
                    nodo = nodo.derecho;
                }
            }

            return new ResultadoBusqueda(false, pasos, ruta.toString().trim());
        }

        // ------------------------------------------
        // PREORDEN
        // ------------------------------------------
        ResultadoRecorrido preorden() {
            StringBuilder sb = new StringBuilder();
            preordenRec(raiz, sb);
            return new ResultadoRecorrido(sb.toString().trim(), contarNodos());
        }

        private void preordenRec(Nodo nodo, StringBuilder sb) {
            if (nodo == null) return;
            sb.append(nodo.valor).append(" ");
            preordenRec(nodo.izquierdo, sb);
            preordenRec(nodo.derecho, sb);
        }

        // ------------------------------------------
        // INORDEN ASCENDENTE
        // ------------------------------------------
        ResultadoRecorrido inorden() {
            StringBuilder sb = new StringBuilder();
            Contador c = new Contador();
            inordenRec(raiz, sb, c);
            return new ResultadoRecorrido(sb.toString().trim(), c.pasos);
        }

        private void inordenRec(Nodo nodo, StringBuilder sb, Contador c) {
            if (nodo == null) return;
            inordenRec(nodo.izquierdo, sb, c);
            c.pasos++;
            sb.append(nodo.valor).append(" ");
            inordenRec(nodo.derecho, sb, c);
        }

        // ------------------------------------------
        // POSTORDEN
        // ------------------------------------------
        ResultadoRecorrido postorden() {
            StringBuilder sb = new StringBuilder();
            postordenRec(raiz, sb);
            return new ResultadoRecorrido(sb.toString().trim(), contarNodos());
        }

        private void postordenRec(Nodo nodo, StringBuilder sb) {
            if (nodo == null) return;
            postordenRec(nodo.izquierdo, sb);
            postordenRec(nodo.derecho, sb);
            sb.append(nodo.valor).append(" ");
        }

        // ------------------------------------------
        // INORDEN DESCENDENTE
        // ------------------------------------------
        ResultadoRecorrido inordenDesc() {
            StringBuilder sb = new StringBuilder();
            Contador c = new Contador();
            inordenDescRec(raiz, sb, c);
            return new ResultadoRecorrido(sb.toString().trim(), c.pasos);
        }

        private void inordenDescRec(Nodo nodo, StringBuilder sb, Contador c) {
            if (nodo == null) return;
            inordenDescRec(nodo.derecho, sb, c);
            c.pasos++;
            sb.append(nodo.valor).append(" ");
            inordenDescRec(nodo.izquierdo, sb, c);
        }

        // ------------------------------------------
        // CONTAR NODOS
        // ------------------------------------------
        int contarNodos() {
            return contarRec(raiz);
        }

        private int contarRec(Nodo nodo) {
            if (nodo == null) return 0;
            return 1 + contarRec(nodo.izquierdo) + contarRec(nodo.derecho);
        }

        // ------------------------------------------
        // IMPRIMIR ÁRBOL EN CONSOLA
        // ------------------------------------------
        void imprimirArbol(Nodo nodo, String espacio, boolean ultimo) {
            if (nodo == null) return;
            System.out.println(espacio + (ultimo ? "└── " : "├── ") + nodo.valor);
            espacio += ultimo ? "    " : "│   ";
            imprimirArbol(nodo.izquierdo, espacio, false);
            imprimirArbol(nodo.derecho, espacio, true);
        }
    }

    // ==================================================
    // 4. DATASET WEKA
    // ==================================================
    static Instances crearDataset(ArrayList<Integer> valores, int raiz) {
        ArrayList<Attribute> atributos = new ArrayList<>();

        atributos.add(new Attribute("valor"));
        atributos.add(new Attribute("posicion"));

        ArrayList<String> clases = new ArrayList<>();
        clases.add("raiz");
        clases.add("izquierda");
        clases.add("derecha");

        atributos.add(new Attribute("clasificacion", clases));

        Instances dataset = new Instances("ArbolBinario", atributos, valores.size());
        dataset.setClassIndex(2);

        for (int i = 0; i < valores.size(); i++) {
            int valor = valores.get(i);
            double[] datos = new double[3];

            datos[0] = valor;
            datos[1] = i + 1;

            if (i == 0) {
                datos[2] = dataset.classAttribute().indexOfValue("raiz");
            } else if (valor < raiz) {
                datos[2] = dataset.classAttribute().indexOfValue("izquierda");
            } else {
                datos[2] = dataset.classAttribute().indexOfValue("derecha");
            }

            dataset.add(new DenseInstance(1.0, datos));
        }

        return dataset;
    }

    // ==================================================
    // 5. UTILIDADES
    // ==================================================
    static int leerEntero(Scanner sc) {
        while (true) {
            try {
                return Integer.parseInt(sc.nextLine().trim());
            } catch (Exception e) {
                System.out.print("Ingrese un número válido: ");
            }
        }
    }

    static void encabezado() {
        System.out.println();
        System.out.println("╔════════════════════════════════════╗");
        System.out.println("║   ÁRBOL BINARIO + WEKA 3.8.0      ║");
        System.out.println("║   Aprendizaje Automático          ║");
        System.out.println("╚════════════════════════════════════╝");
    }

    // ==================================================
    // 6. MAIN
    // ==================================================
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        ArbolBST arbol = new ArbolBST();
        ArrayList<Integer> historial = new ArrayList<>();

        encabezado();

        // -------- RAÍZ --------
        System.out.print("\nIngrese nodo raíz: ");
        int raiz = leerEntero(sc);
        arbol.raiz = arbol.insertar(arbol.raiz, raiz);
        historial.add(raiz);
        System.out.println("✔ Raíz creada correctamente.");

        // -------- INSERTAR NODOS --------
        while (true) {
            System.out.print("\nIngrese nodo (o FIN para terminar): ");
            String entrada = sc.nextLine().trim();

            if (entrada.equalsIgnoreCase("FIN")) break;

            try {
                int valor = Integer.parseInt(entrada);
                arbol.raiz = arbol.insertar(arbol.raiz, valor);
                historial.add(valor);

                if (valor < raiz) {
                    System.out.println("→ Clasificado a IZQUIERDA");
                } else if (valor > raiz) {
                    System.out.println("→ Clasificado a DERECHA");
                } else {
                    System.out.println("→ Igual a la raíz");
                }
            } catch (Exception e) {
                System.out.println("[!] Número inválido.");
            }
        }

        // -------- IMPRIMIR ÁRBOL --------
        System.out.println("\n══════════════════════════════");
        System.out.println("      ESTRUCTURA DEL ÁRBOL");
        System.out.println("══════════════════════════════");
        arbol.imprimirArbol(arbol.raiz, "", true);

        // -------- RECORRIDOS --------
        ResultadoRecorrido pre = arbol.preorden();
        ResultadoRecorrido in = arbol.inorden();
        ResultadoRecorrido post = arbol.postorden();
        ResultadoRecorrido desc = arbol.inordenDesc();

        System.out.println("\n══════════════════════════════");
        System.out.println("          RECORRIDOS");
        System.out.println("══════════════════════════════");
        System.out.println("Preorden   : " + pre.valores);
        System.out.println("Inorden ↑  : " + in.valores);
        System.out.println("Postorden  : " + post.valores);
        System.out.println("Inorden ↓  : " + desc.valores);

        // -------- PASOS --------
        System.out.println("\n══════════════════════════════");
        System.out.println("        PASOS RECORRIDOS");
        System.out.println("══════════════════════════════");
        System.out.println("Inorden Ascendente : " + in.pasos);
        System.out.println("Inorden Descendente: " + desc.pasos);

        // -------- BÚSQUEDA --------
        System.out.print("\nNúmero a buscar: ");
        int buscar = leerEntero(sc);

        ResultadoBusqueda resultado = arbol.buscar(arbol.raiz, buscar);

        System.out.println("\n══════════════════════════════");
        System.out.println("       RESULTADO BÚSQUEDA");
        System.out.println("══════════════════════════════");
        System.out.println("Número buscado: " + buscar);
        System.out.println("Resultado: " + (resultado.encontrado ? "✔ ENCONTRADO" : "✘ NO ENCONTRADO"));
        System.out.println("Pasos usados: " + resultado.pasos);
        System.out.println("Ruta: " + resultado.ruta);

        // -------- WEKA --------
        System.out.println("\n══════════════════════════════");
        System.out.println("         DATASET WEKA");
        System.out.println("══════════════════════════════");

        try {
            Instances dataset = crearDataset(historial, raiz);
            System.out.println(dataset);
            System.out.println("Instancias: " + dataset.numInstances());
        } catch (Exception e) {
            System.out.println("Error WEKA: " + e.getMessage());
        }

        System.out.println("\n══════════════════════════════");
        System.out.println("       FIN DEL PROGRAMA");
        System.out.println("══════════════════════════════");

        sc.close();
    }
}