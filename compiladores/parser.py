import ply.yacc as yacc
from lexer import tokens

def p_programa(p):
    '''programa : reservar
                | consultar
                | cancelar'''
    p[0] = p[1]


def p_reservar(p):
    '''reservar : RESERVAR recurso STRING DATA DATE HORA_INICIO TIME HORA_FIM TIME'''
    p[0] = {
        "tipo": "reservar",
        "recurso_categoria": p[2],
        "recurso_nome": p[3],
        "data": p[5],
        "inicio": p[7],
        "fim": p[9]
    }

def p_consultar(p):
    '''consultar : CONSULTAR RESERVAS
                    | CONSULTAR RESERVAS ATIVAS
                    | CONSULTAR RESERVAS CANCELADAS  '''

    estado = "todas" 

    if len(p) == 4:
        if p[3] == "ativas":
            estado = "ativa"
        elif p[3] == "canceladas":
            estado = "cancelada"

    p[0] = {
        "tipo": "consultar",
        "alvo": "reservas",
        "estado": estado
    }                      

def p_recurso(p):
    '''recurso : SALA
                | LABORATORIO 
                | EQUIPAMENTO'''

    p[0] = p[1]

def p_cancelar(p):
     '''cancelar : CANCELAR RESERVA recurso NUMBER'''

     p[0] = {
        "tipo": "cancelar",
        "recurso_categoria": p[3],
        "id_reserva": p[4]
     }   


def p_error(p):
    print("Syntax error")

parser = yacc.yacc()