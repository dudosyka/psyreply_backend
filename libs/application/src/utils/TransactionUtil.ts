import { Transaction } from 'sequelize';

export class TransactionUtil {
  private static host: { transaction: Transaction | null } = {
    transaction: null,
  };

  public static getHost(): { transaction: Transaction } | any {
    if (this.host.transaction) return this.host;
    else return {};
  }

  public static setHost(t: Transaction) {
    this.host = { transaction: t };
  }

  public static isSet(): boolean {
    return this.host.transaction != null;
  }

  public static commit(): Promise<void> {
    if (!this.host.transaction) return;
    const res = this.host.transaction.commit();
    this.host.transaction = null;
    return res;
  }

  public static rollback(): Promise<void> {
    if (!this.host.transaction) return;
    const res = this.host.transaction.rollback();
    this.host.transaction = null;
    return res;
  }
}
