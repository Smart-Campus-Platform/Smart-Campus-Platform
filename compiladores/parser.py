import ply.yacc as yacc
from lexer import tokens

def p_programa(p):
    '''programa : reservar'''
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

def p_recurso(p):
    '''recurso : SALA
                | LABORATORIO '''

    p[0] = p[1]


def p_error(p):
    print("Syntax error")

parser = yacc.yacc()