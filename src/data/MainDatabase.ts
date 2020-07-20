import knex from 'knex'
import Knex from 'knex'

export abstract class MainDatabase {
    private static connection: Knex | null = null;
    abstract tableName: string;
    
    protected getConnection(): Knex {
      if (MainDatabase.connection === null) {
        MainDatabase.connection = knex({
          client: "mysql",
          connection: {
            host: process.env.DB_HOST,
            port: 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE_NAME,
          },
        });
      }
      return MainDatabase.connection;
    }
  

    public booleanToInt(value: string): number {
      return value && 1 || 0
    }

    public intToboolean(value: number): boolean {
      return value === 1 
    }

    public static async destroyConnection(): Promise<void> {
      if (MainDatabase.connection) {
          await MainDatabase.connection.destroy();
          MainDatabase.connection = null;
      }
  }

}

