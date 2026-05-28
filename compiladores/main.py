import sys #isto é o módulo que vamos usar para permitir ler argumentos vindos do terminal/Node
import json #este módulo permite converter dicionários python em json
from parser import parser


def getCommand (codigo):
    resultado = parser.parse(codigo)

    if resultado is None:
        raise ValueError("Comando inválido")

    return resultado    

if len(sys.argv) > 1:
    codigo = " ".join(sys.argv[1:])

    try:
        resultado = getCommand(codigo)
        print(json.dumps(resultado))

    except Exception as e:
        print(json.dumps({"erro": str(e)}))
        sys.exit(1)

else:
    while True:
        codigo = input("\nComando ('sair' para terminar): ")

        if codigo.lower() == "sair":
            break

        try:
            resultado = getCommand(codigo)
            print(json.dumps(resultado))

        except Exception as e:
            print("Erro no comando!")
            print(e)       