import ply.lex as lex

reserved = {
    "reservar": "RESERVAR",
    "tipo": "TIPO",
    "sala": "SALA",
    "laboratorio": "LABORATORIO",
    "data": "DATA",
    "hora_inicio": "HORA_INICIO",
    "hora_fim": "HORA_FIM",
    "equipamento": "EQUIPAMENTO",

    "cancelar": "CANCELAR",

    "reservas": "RESERVAS",
    "ativas": "ATIVAS",
    "canceladas": "CANCELADAS",

    "consultar": "CONSULTAR",
    "periodo": "PERIODO",
    "a": "A",
    "filtro": "FILTRO",
    "estado": "ESTADO",

    "disponibilidade": "DISPONIBILIDADE",
    "piso": "PISO",

    "batch": "BATCH"
}

tokens = [
    "STRING",
    "NUMBER",
    "DATE",
    "TIME",
    "EQ",
    "NE",
    "NEWLINE",
] + list(reserved.values())

literals = [ "="]

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
    t.type = reserved.get(t.value, 'ID')
    return t

def t_newline(t):
    r'\n+'
    t.lexer.lineno += len(t.value)

def t_error(t):
    t.lexer.skip(1)

lexer = lex.lex()



