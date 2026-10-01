export class CoreError extends Error { constructor(message, code="CORE_ERROR", details={}) { super(message); this.name="CoreError"; this.code=code; this.details=details; } }
export class CommandError extends CoreError { constructor(message, details={}) { super(message,"COMMAND_ERROR",details); this.name="CommandError"; } }
export class PluginError extends CoreError { constructor(message, details={}) { super(message,"PLUGIN_ERROR",details); this.name="PluginError"; } }
export class DatabaseError extends CoreError { constructor(message, details={}) { super(message,"DATABASE_ERROR",details); this.name="DatabaseError"; } }
export class ConnectionError extends CoreError { constructor(message, details={}) { super(message,"CONNECTION_ERROR",details); this.name="ConnectionError"; } }
export class ValidationError extends CoreError { constructor(message, details={}) { super(message,"VALIDATION_ERROR",details); this.name="ValidationError"; } }
export class SystemError extends CoreError { constructor(message, details={}) { super(message,"SYSTEM_ERROR",details); this.name="SystemError"; } }
export const isCoreError=e=>e instanceof CoreError;