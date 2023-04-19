from neo4j import GraphDatabase
import logging
from neo4j.exceptions import ServiceUnavailable
import os
from dotenv import load_dotenv


load_dotenv()


class App:

    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def test(self):
        with self.driver.session(database="neo4j") as session:
            result = session.execute_write(
                self.get_paths_with_2_plus_HCM
            )
            for row in result:
                print(row)

    @staticmethod
    def get_paths_with_2_plus_HCM(tx):
        query = """
            MATCH (leaf:Cat)
            WHERE NOT (leaf)-[:SIRE|DAM]->()
            CALL apoc.path.spanningTree(leaf, {relationshipFilter: "<SIRE|<DAM", minLevel: 1})
            YIELD path
            WITH path, length(path) as path_length, [node in nodes(path) WHERE node.HCM = "HCM"] as hcm_nodes
            WHERE size(hcm_nodes) > 1
            WITH path, path_length
            ORDER BY path_length DESC
            UNWIND nodes(path) AS n
            OPTIONAL MATCH (n)<-[:SIRE]-(sire) 
            OPTIONAL MATCH (n)<-[:DAM]-(dam)
            RETURN n, sire, dam;
        """
        result = tx.run(query)
        try:
            return [row for row in result]
        # Capture any errors along with the query and data for traceability
        except ServiceUnavailable as exception:
            logging.error("{query} raised an error: \n {exception}".format(
                query=query, exception=exception))
            raise


if __name__ == "__main__":
    uri = os.environ.get('DATABASE_URL')
    user = os.environ.get('DATABASE_USER')
    password = os.environ.get('DATABASE_PASSWORD')
    app = App(uri, user, password)
    app.test()
    app.close()
