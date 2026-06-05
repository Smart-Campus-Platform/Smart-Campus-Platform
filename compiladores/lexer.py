import ply.lex as lex

reserved = {
    "reservar": "RESERVAR",
    "sala": "SALA",
    "laboratorio": "LABORATORIO",
    "data": "DATA",
    "hora_inicio": "HORA_INICIO",
    "hora_fim": "HORA_FIM",
    "equipamento": "EQUIPAMENTO",

    "cancelar": "CANCELAR",
    "reserva": "RESERVA",

    "reservas": "RESERVAS",
    "ativas": "ATIVAS",
    "canceladas": "CANCELADAS",

    "consultar": "CONSULTAR",

    "disponibilidade": "DISPONIBILIDADE",
}

tokens = [
    "STRING",
    "NUMBER",
    "DATE",
    "TIME",
] + list(reserved.values())

t_ignore = " \t"

def t_STRING(t):
    r'"[^"]*"' #preciso das aspas para dar o valor de string quando é inserido, mas para o interpretador não pode ter as aspas
    t.value = t.value[1:-1]
    return t

def t_TIME(t):
    r'\d{2}:\d{2}'
    return t

def t_DATE(t):
    r'\d{4}-\d{2}-\d{2}'
    return t

def t_NUMBER(t):
    r'\d+'
    t.value = int(t.value)
    return t

def t_ID(t):
    r'[a-zA-Z_][a-zA-Z_0-9]*'
    token_type = reserved.get(t.value)
    if token_type:
        t.type = token_type
        return t
    t.lexer.skip(len(t.value))

def t_newline(t):
    r'\n+'
    t.lexer.lineno += len(t.value)

def t_error(t):
    t.lexer.skip(1)

lexer = lex.lex()



