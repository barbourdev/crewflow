export class JobQueue {
  // TODO: Implementar na Etapa 3 com p-queue
  async add<T>(_fn: () => Promise<T>): Promise<T> {
    return _fn()
  }
}
