class LSSInterpreter:

    def execute(self, code):
        if code is None:
            return "Erro: comando inválido"

        if code["tipo"] == "reservar":
            return (
                f"Reserva criada: {code['recurso_categoria']} "
                f"{code['recurso_nome']} em {code['data']} "
                f"das {code['inicio']} às {code['fim']}"
            )
