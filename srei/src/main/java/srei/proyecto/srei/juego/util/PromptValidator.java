package srei.proyecto.srei.juego.util;

public class PromptValidator {

    public static boolean esValido(String prompt){

        if(prompt == null || prompt.length() < 10){
            return false;
        }

        String texto = prompt.toLowerCase();

        String[] prohibidas = {
                "racismo",
                "odio",
                "violencia",
                "insulto",
                "matar",
                "discriminacion"
        };

        for(String palabra : prohibidas){
            if(texto.contains(palabra)){
                return false;
            }
        }

        return true;
    }
}