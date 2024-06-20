import {
  ContextItem,
  ContextProviderDescription,
  ContextProviderExtras,
  ContextSubmenuItem,
  LoadSubmenuItemsArgs,
} from "../../index.js";
import { BaseContextProvider } from "../index.js";

class DatabaseContextProvider extends BaseContextProvider {
  static description: ContextProviderDescription = {
    title: "database",
    displayTitle: "数据库",
    description: "表架构",
    type: "submenu",
  };

  async getContextItems(
    query: string,
    extras: ContextProviderExtras,
  ): Promise<ContextItem[]> {
    const contextItems: ContextItem[] = [];

    const connections = this.options?.connections;

    if (connections === null) {
      return contextItems;
    }

    const [connectionName, table] = query.split(".");

    const getDatabaseAdapter = await require("dbinfoz");

    for (const connection of connections) {
      if (connection.name === connectionName) {
        const adapter = getDatabaseAdapter(
          connection.connection_type,
          connection.connection,
        );
        const tablesAndSchemas = await adapter.getAllTablesAndSchemas(
          connection.connection.database,
        );

        if (table === "all") {
          let prompt = `在 ${connection.connection_type} 上所有表的架构是`;
          prompt += JSON.stringify(tablesAndSchemas);

          const contextItem = {
            name: `${connectionName}-all-tables-schemas`,
            description: "所有表的架构。",
            content: prompt,
          };

          contextItems.push(contextItem);
        } else {
          const tables = Object.keys(tablesAndSchemas);

          tables.forEach((tableName) => {
            if (table === tableName) {
              let prompt = `在 ${connection.connection_type} 上 ${tableName} 的架构是`;
              prompt += JSON.stringify(tablesAndSchemas[tableName]);

              const contextItem = {
                name: `${connectionName}-${tableName}-schema`,
                description: `${tableName} 架构`,
                content: prompt,
              };

              contextItems.push(contextItem);
            }
          });
        }
      }
    }

    return contextItems;
  }

  async loadSubmenuItems(
    args: LoadSubmenuItemsArgs,
  ): Promise<ContextSubmenuItem[]> {
    const contextItems: ContextSubmenuItem[] = [];
    const connections = this.options?.connections;

    if (connections === null) {
      return contextItems;
    }

    const getDatabaseAdapter = await require("dbinfoz");

    for (const connection of connections) {
      const adapter = getDatabaseAdapter(
        connection.connection_type,
        connection.connection,
      );
      const tablesAndSchemas = await adapter.getAllTablesAndSchemas(
        connection.connection.database,
      );
      const tables = Object.keys(tablesAndSchemas);

      const contextItem = {
        id: `${connection.name}.all`,
        title: `${connection.name} 所有表的架构`,
        description: "",
      };

      contextItems.push(contextItem);

      tables.forEach((tableName) => {
        const contextItem = {
          id: `${connection.name}.${tableName}`,
          title: `${connection.name}.${tableName} 架构`,
          description: "",
        };

        contextItems.push(contextItem);
      });
    }

    return contextItems;
  }
}

export default DatabaseContextProvider;
