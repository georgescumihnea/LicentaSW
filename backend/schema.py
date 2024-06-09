import sqlite3
import pydot
from collections import defaultdict

# Connect to the SQLite database
conn = sqlite3.connect('my_database.db')
cursor = conn.cursor()

# Fetch the schema for all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

# Dictionary to store table schemas
schemas = defaultdict(list)

for table in tables:
    table_name = table[0]
    cursor.execute(f"PRAGMA table_info({table_name});")
    columns = cursor.fetchall()
    schemas[table_name] = columns

# Create a graph object
graph = pydot.Dot(graph_type='digraph')

# Add tables and columns to the graph
for table_name, columns in schemas.items():
    table_node = pydot.Node(table_name, shape='box')
    graph.add_node(table_node)
    for column in columns:
        column_name = column[1]
        column_node = pydot.Node(f"{table_name}.{column_name}", shape='ellipse', label=column_name)
        graph.add_node(column_node)
        graph.add_edge(pydot.Edge(table_node, column_node))

# Save the graph to a file
graph.write_png('database_schema.png')

# Close the connection
conn.close()
