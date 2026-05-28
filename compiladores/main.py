import sys
import json
from parser import parser

while True:
    codigo = input("\nComando ('sair' para terminar): ")

    if codigo.lower() == "sair":
        break

    try:
        resultado = parser.parse(codigo)

        print("\nReserva criada")
        print(f"tipo: {resultado['recurso_categoria']}")
        print(f"sala: {resultado['recurso_nome']}")
        print(f"data: {resultado['data']}")
        print(f"hora_inicio: {resultado['inicio']}")
        print(f"hora_fim: {resultado['fim']}")

    except Exception as e:
        print("Erro no comando!")
        print(e)