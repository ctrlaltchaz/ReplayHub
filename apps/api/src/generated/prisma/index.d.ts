
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model GlobalUser
 * 
 */
export type GlobalUser = $Result.DefaultSelection<Prisma.$GlobalUserPayload>
/**
 * Model Organisation
 * 
 */
export type Organisation = $Result.DefaultSelection<Prisma.$OrganisationPayload>
/**
 * Model OrganisationAdmin
 * 
 */
export type OrganisationAdmin = $Result.DefaultSelection<Prisma.$OrganisationAdminPayload>
/**
 * Model Note
 * 
 */
export type Note = $Result.DefaultSelection<Prisma.$NotePayload>
/**
 * Model OrgUser
 * 
 */
export type OrgUser = $Result.DefaultSelection<Prisma.$OrgUserPayload>
/**
 * Model Role
 * 
 */
export type Role = $Result.DefaultSelection<Prisma.$RolePayload>
/**
 * Model Permission
 * 
 */
export type Permission = $Result.DefaultSelection<Prisma.$PermissionPayload>
/**
 * Model RolePermission
 * 
 */
export type RolePermission = $Result.DefaultSelection<Prisma.$RolePermissionPayload>
/**
 * Model OrgUserRole
 * 
 */
export type OrgUserRole = $Result.DefaultSelection<Prisma.$OrgUserRolePayload>
/**
 * Model OrgInvite
 * 
 */
export type OrgInvite = $Result.DefaultSelection<Prisma.$OrgInvitePayload>
/**
 * Model AuditLog
 * 
 */
export type AuditLog = $Result.DefaultSelection<Prisma.$AuditLogPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const AuditAction: {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  INVITE: 'INVITE',
  ACCEPT_INVITE: 'ACCEPT_INVITE',
  REVOKE_INVITE: 'REVOKE_INVITE'
};

export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction]


export const AuditEntityType: {
  GLOBAL_USER: 'GLOBAL_USER',
  ORGANISATION: 'ORGANISATION',
  ORG_USER: 'ORG_USER',
  ORG_USER_ROLE: 'ORG_USER_ROLE',
  ROLE: 'ROLE',
  PERMISSION: 'PERMISSION',
  ORG_INVITE: 'ORG_INVITE'
};

export type AuditEntityType = (typeof AuditEntityType)[keyof typeof AuditEntityType]

}

export type AuditAction = $Enums.AuditAction

export const AuditAction: typeof $Enums.AuditAction

export type AuditEntityType = $Enums.AuditEntityType

export const AuditEntityType: typeof $Enums.AuditEntityType

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more GlobalUsers
 * const globalUsers = await prisma.globalUser.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more GlobalUsers
   * const globalUsers = await prisma.globalUser.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.globalUser`: Exposes CRUD operations for the **GlobalUser** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GlobalUsers
    * const globalUsers = await prisma.globalUser.findMany()
    * ```
    */
  get globalUser(): Prisma.GlobalUserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.organisation`: Exposes CRUD operations for the **Organisation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Organisations
    * const organisations = await prisma.organisation.findMany()
    * ```
    */
  get organisation(): Prisma.OrganisationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.organisationAdmin`: Exposes CRUD operations for the **OrganisationAdmin** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OrganisationAdmins
    * const organisationAdmins = await prisma.organisationAdmin.findMany()
    * ```
    */
  get organisationAdmin(): Prisma.OrganisationAdminDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.note`: Exposes CRUD operations for the **Note** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Notes
    * const notes = await prisma.note.findMany()
    * ```
    */
  get note(): Prisma.NoteDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.orgUser`: Exposes CRUD operations for the **OrgUser** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OrgUsers
    * const orgUsers = await prisma.orgUser.findMany()
    * ```
    */
  get orgUser(): Prisma.OrgUserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.role`: Exposes CRUD operations for the **Role** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Roles
    * const roles = await prisma.role.findMany()
    * ```
    */
  get role(): Prisma.RoleDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.permission`: Exposes CRUD operations for the **Permission** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Permissions
    * const permissions = await prisma.permission.findMany()
    * ```
    */
  get permission(): Prisma.PermissionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.rolePermission`: Exposes CRUD operations for the **RolePermission** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RolePermissions
    * const rolePermissions = await prisma.rolePermission.findMany()
    * ```
    */
  get rolePermission(): Prisma.RolePermissionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.orgUserRole`: Exposes CRUD operations for the **OrgUserRole** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OrgUserRoles
    * const orgUserRoles = await prisma.orgUserRole.findMany()
    * ```
    */
  get orgUserRole(): Prisma.OrgUserRoleDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.orgInvite`: Exposes CRUD operations for the **OrgInvite** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OrgInvites
    * const orgInvites = await prisma.orgInvite.findMany()
    * ```
    */
  get orgInvite(): Prisma.OrgInviteDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.auditLog`: Exposes CRUD operations for the **AuditLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AuditLogs
    * const auditLogs = await prisma.auditLog.findMany()
    * ```
    */
  get auditLog(): Prisma.AuditLogDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.17.0
   * Query Engine version: c0aafc03b8ef6cdced8654b9a817999e02457d6a
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    GlobalUser: 'GlobalUser',
    Organisation: 'Organisation',
    OrganisationAdmin: 'OrganisationAdmin',
    Note: 'Note',
    OrgUser: 'OrgUser',
    Role: 'Role',
    Permission: 'Permission',
    RolePermission: 'RolePermission',
    OrgUserRole: 'OrgUserRole',
    OrgInvite: 'OrgInvite',
    AuditLog: 'AuditLog'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "globalUser" | "organisation" | "organisationAdmin" | "note" | "orgUser" | "role" | "permission" | "rolePermission" | "orgUserRole" | "orgInvite" | "auditLog"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      GlobalUser: {
        payload: Prisma.$GlobalUserPayload<ExtArgs>
        fields: Prisma.GlobalUserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GlobalUserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalUserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GlobalUserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalUserPayload>
          }
          findFirst: {
            args: Prisma.GlobalUserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalUserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GlobalUserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalUserPayload>
          }
          findMany: {
            args: Prisma.GlobalUserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalUserPayload>[]
          }
          create: {
            args: Prisma.GlobalUserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalUserPayload>
          }
          createMany: {
            args: Prisma.GlobalUserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GlobalUserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalUserPayload>[]
          }
          delete: {
            args: Prisma.GlobalUserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalUserPayload>
          }
          update: {
            args: Prisma.GlobalUserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalUserPayload>
          }
          deleteMany: {
            args: Prisma.GlobalUserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GlobalUserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.GlobalUserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalUserPayload>[]
          }
          upsert: {
            args: Prisma.GlobalUserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GlobalUserPayload>
          }
          aggregate: {
            args: Prisma.GlobalUserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGlobalUser>
          }
          groupBy: {
            args: Prisma.GlobalUserGroupByArgs<ExtArgs>
            result: $Utils.Optional<GlobalUserGroupByOutputType>[]
          }
          count: {
            args: Prisma.GlobalUserCountArgs<ExtArgs>
            result: $Utils.Optional<GlobalUserCountAggregateOutputType> | number
          }
        }
      }
      Organisation: {
        payload: Prisma.$OrganisationPayload<ExtArgs>
        fields: Prisma.OrganisationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrganisationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganisationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrganisationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganisationPayload>
          }
          findFirst: {
            args: Prisma.OrganisationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganisationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrganisationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganisationPayload>
          }
          findMany: {
            args: Prisma.OrganisationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganisationPayload>[]
          }
          create: {
            args: Prisma.OrganisationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganisationPayload>
          }
          createMany: {
            args: Prisma.OrganisationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrganisationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganisationPayload>[]
          }
          delete: {
            args: Prisma.OrganisationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganisationPayload>
          }
          update: {
            args: Prisma.OrganisationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganisationPayload>
          }
          deleteMany: {
            args: Prisma.OrganisationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrganisationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OrganisationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganisationPayload>[]
          }
          upsert: {
            args: Prisma.OrganisationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganisationPayload>
          }
          aggregate: {
            args: Prisma.OrganisationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrganisation>
          }
          groupBy: {
            args: Prisma.OrganisationGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrganisationGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrganisationCountArgs<ExtArgs>
            result: $Utils.Optional<OrganisationCountAggregateOutputType> | number
          }
        }
      }
      OrganisationAdmin: {
        payload: Prisma.$OrganisationAdminPayload<ExtArgs>
        fields: Prisma.OrganisationAdminFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrganisationAdminFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganisationAdminPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrganisationAdminFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganisationAdminPayload>
          }
          findFirst: {
            args: Prisma.OrganisationAdminFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganisationAdminPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrganisationAdminFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganisationAdminPayload>
          }
          findMany: {
            args: Prisma.OrganisationAdminFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganisationAdminPayload>[]
          }
          create: {
            args: Prisma.OrganisationAdminCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganisationAdminPayload>
          }
          createMany: {
            args: Prisma.OrganisationAdminCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrganisationAdminCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganisationAdminPayload>[]
          }
          delete: {
            args: Prisma.OrganisationAdminDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganisationAdminPayload>
          }
          update: {
            args: Prisma.OrganisationAdminUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganisationAdminPayload>
          }
          deleteMany: {
            args: Prisma.OrganisationAdminDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrganisationAdminUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OrganisationAdminUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganisationAdminPayload>[]
          }
          upsert: {
            args: Prisma.OrganisationAdminUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganisationAdminPayload>
          }
          aggregate: {
            args: Prisma.OrganisationAdminAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrganisationAdmin>
          }
          groupBy: {
            args: Prisma.OrganisationAdminGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrganisationAdminGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrganisationAdminCountArgs<ExtArgs>
            result: $Utils.Optional<OrganisationAdminCountAggregateOutputType> | number
          }
        }
      }
      Note: {
        payload: Prisma.$NotePayload<ExtArgs>
        fields: Prisma.NoteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.NoteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.NoteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotePayload>
          }
          findFirst: {
            args: Prisma.NoteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.NoteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotePayload>
          }
          findMany: {
            args: Prisma.NoteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotePayload>[]
          }
          create: {
            args: Prisma.NoteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotePayload>
          }
          createMany: {
            args: Prisma.NoteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.NoteCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotePayload>[]
          }
          delete: {
            args: Prisma.NoteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotePayload>
          }
          update: {
            args: Prisma.NoteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotePayload>
          }
          deleteMany: {
            args: Prisma.NoteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.NoteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.NoteUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotePayload>[]
          }
          upsert: {
            args: Prisma.NoteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotePayload>
          }
          aggregate: {
            args: Prisma.NoteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateNote>
          }
          groupBy: {
            args: Prisma.NoteGroupByArgs<ExtArgs>
            result: $Utils.Optional<NoteGroupByOutputType>[]
          }
          count: {
            args: Prisma.NoteCountArgs<ExtArgs>
            result: $Utils.Optional<NoteCountAggregateOutputType> | number
          }
        }
      }
      OrgUser: {
        payload: Prisma.$OrgUserPayload<ExtArgs>
        fields: Prisma.OrgUserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrgUserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgUserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrgUserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgUserPayload>
          }
          findFirst: {
            args: Prisma.OrgUserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgUserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrgUserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgUserPayload>
          }
          findMany: {
            args: Prisma.OrgUserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgUserPayload>[]
          }
          create: {
            args: Prisma.OrgUserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgUserPayload>
          }
          createMany: {
            args: Prisma.OrgUserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrgUserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgUserPayload>[]
          }
          delete: {
            args: Prisma.OrgUserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgUserPayload>
          }
          update: {
            args: Prisma.OrgUserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgUserPayload>
          }
          deleteMany: {
            args: Prisma.OrgUserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrgUserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OrgUserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgUserPayload>[]
          }
          upsert: {
            args: Prisma.OrgUserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgUserPayload>
          }
          aggregate: {
            args: Prisma.OrgUserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrgUser>
          }
          groupBy: {
            args: Prisma.OrgUserGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrgUserGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrgUserCountArgs<ExtArgs>
            result: $Utils.Optional<OrgUserCountAggregateOutputType> | number
          }
        }
      }
      Role: {
        payload: Prisma.$RolePayload<ExtArgs>
        fields: Prisma.RoleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RoleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RoleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>
          }
          findFirst: {
            args: Prisma.RoleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RoleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>
          }
          findMany: {
            args: Prisma.RoleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>[]
          }
          create: {
            args: Prisma.RoleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>
          }
          createMany: {
            args: Prisma.RoleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RoleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>[]
          }
          delete: {
            args: Prisma.RoleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>
          }
          update: {
            args: Prisma.RoleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>
          }
          deleteMany: {
            args: Prisma.RoleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RoleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RoleUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>[]
          }
          upsert: {
            args: Prisma.RoleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePayload>
          }
          aggregate: {
            args: Prisma.RoleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRole>
          }
          groupBy: {
            args: Prisma.RoleGroupByArgs<ExtArgs>
            result: $Utils.Optional<RoleGroupByOutputType>[]
          }
          count: {
            args: Prisma.RoleCountArgs<ExtArgs>
            result: $Utils.Optional<RoleCountAggregateOutputType> | number
          }
        }
      }
      Permission: {
        payload: Prisma.$PermissionPayload<ExtArgs>
        fields: Prisma.PermissionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PermissionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PermissionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PermissionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PermissionPayload>
          }
          findFirst: {
            args: Prisma.PermissionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PermissionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PermissionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PermissionPayload>
          }
          findMany: {
            args: Prisma.PermissionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PermissionPayload>[]
          }
          create: {
            args: Prisma.PermissionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PermissionPayload>
          }
          createMany: {
            args: Prisma.PermissionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PermissionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PermissionPayload>[]
          }
          delete: {
            args: Prisma.PermissionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PermissionPayload>
          }
          update: {
            args: Prisma.PermissionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PermissionPayload>
          }
          deleteMany: {
            args: Prisma.PermissionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PermissionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PermissionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PermissionPayload>[]
          }
          upsert: {
            args: Prisma.PermissionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PermissionPayload>
          }
          aggregate: {
            args: Prisma.PermissionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePermission>
          }
          groupBy: {
            args: Prisma.PermissionGroupByArgs<ExtArgs>
            result: $Utils.Optional<PermissionGroupByOutputType>[]
          }
          count: {
            args: Prisma.PermissionCountArgs<ExtArgs>
            result: $Utils.Optional<PermissionCountAggregateOutputType> | number
          }
        }
      }
      RolePermission: {
        payload: Prisma.$RolePermissionPayload<ExtArgs>
        fields: Prisma.RolePermissionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RolePermissionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RolePermissionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload>
          }
          findFirst: {
            args: Prisma.RolePermissionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RolePermissionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload>
          }
          findMany: {
            args: Prisma.RolePermissionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload>[]
          }
          create: {
            args: Prisma.RolePermissionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload>
          }
          createMany: {
            args: Prisma.RolePermissionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RolePermissionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload>[]
          }
          delete: {
            args: Prisma.RolePermissionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload>
          }
          update: {
            args: Prisma.RolePermissionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload>
          }
          deleteMany: {
            args: Prisma.RolePermissionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RolePermissionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RolePermissionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload>[]
          }
          upsert: {
            args: Prisma.RolePermissionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RolePermissionPayload>
          }
          aggregate: {
            args: Prisma.RolePermissionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRolePermission>
          }
          groupBy: {
            args: Prisma.RolePermissionGroupByArgs<ExtArgs>
            result: $Utils.Optional<RolePermissionGroupByOutputType>[]
          }
          count: {
            args: Prisma.RolePermissionCountArgs<ExtArgs>
            result: $Utils.Optional<RolePermissionCountAggregateOutputType> | number
          }
        }
      }
      OrgUserRole: {
        payload: Prisma.$OrgUserRolePayload<ExtArgs>
        fields: Prisma.OrgUserRoleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrgUserRoleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgUserRolePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrgUserRoleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgUserRolePayload>
          }
          findFirst: {
            args: Prisma.OrgUserRoleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgUserRolePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrgUserRoleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgUserRolePayload>
          }
          findMany: {
            args: Prisma.OrgUserRoleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgUserRolePayload>[]
          }
          create: {
            args: Prisma.OrgUserRoleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgUserRolePayload>
          }
          createMany: {
            args: Prisma.OrgUserRoleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrgUserRoleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgUserRolePayload>[]
          }
          delete: {
            args: Prisma.OrgUserRoleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgUserRolePayload>
          }
          update: {
            args: Prisma.OrgUserRoleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgUserRolePayload>
          }
          deleteMany: {
            args: Prisma.OrgUserRoleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrgUserRoleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OrgUserRoleUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgUserRolePayload>[]
          }
          upsert: {
            args: Prisma.OrgUserRoleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgUserRolePayload>
          }
          aggregate: {
            args: Prisma.OrgUserRoleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrgUserRole>
          }
          groupBy: {
            args: Prisma.OrgUserRoleGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrgUserRoleGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrgUserRoleCountArgs<ExtArgs>
            result: $Utils.Optional<OrgUserRoleCountAggregateOutputType> | number
          }
        }
      }
      OrgInvite: {
        payload: Prisma.$OrgInvitePayload<ExtArgs>
        fields: Prisma.OrgInviteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrgInviteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgInvitePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrgInviteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgInvitePayload>
          }
          findFirst: {
            args: Prisma.OrgInviteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgInvitePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrgInviteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgInvitePayload>
          }
          findMany: {
            args: Prisma.OrgInviteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgInvitePayload>[]
          }
          create: {
            args: Prisma.OrgInviteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgInvitePayload>
          }
          createMany: {
            args: Prisma.OrgInviteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrgInviteCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgInvitePayload>[]
          }
          delete: {
            args: Prisma.OrgInviteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgInvitePayload>
          }
          update: {
            args: Prisma.OrgInviteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgInvitePayload>
          }
          deleteMany: {
            args: Prisma.OrgInviteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrgInviteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OrgInviteUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgInvitePayload>[]
          }
          upsert: {
            args: Prisma.OrgInviteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrgInvitePayload>
          }
          aggregate: {
            args: Prisma.OrgInviteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrgInvite>
          }
          groupBy: {
            args: Prisma.OrgInviteGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrgInviteGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrgInviteCountArgs<ExtArgs>
            result: $Utils.Optional<OrgInviteCountAggregateOutputType> | number
          }
        }
      }
      AuditLog: {
        payload: Prisma.$AuditLogPayload<ExtArgs>
        fields: Prisma.AuditLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AuditLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AuditLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          findFirst: {
            args: Prisma.AuditLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AuditLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          findMany: {
            args: Prisma.AuditLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          create: {
            args: Prisma.AuditLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          createMany: {
            args: Prisma.AuditLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AuditLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          delete: {
            args: Prisma.AuditLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          update: {
            args: Prisma.AuditLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          deleteMany: {
            args: Prisma.AuditLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AuditLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AuditLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          upsert: {
            args: Prisma.AuditLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          aggregate: {
            args: Prisma.AuditLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAuditLog>
          }
          groupBy: {
            args: Prisma.AuditLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<AuditLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.AuditLogCountArgs<ExtArgs>
            result: $Utils.Optional<AuditLogCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    globalUser?: GlobalUserOmit
    organisation?: OrganisationOmit
    organisationAdmin?: OrganisationAdminOmit
    note?: NoteOmit
    orgUser?: OrgUserOmit
    role?: RoleOmit
    permission?: PermissionOmit
    rolePermission?: RolePermissionOmit
    orgUserRole?: OrgUserRoleOmit
    orgInvite?: OrgInviteOmit
    auditLog?: AuditLogOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type GlobalUserCountOutputType
   */

  export type GlobalUserCountOutputType = {
    organisations: number
    organisationAdmins: number
    auditLogs: number
  }

  export type GlobalUserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organisations?: boolean | GlobalUserCountOutputTypeCountOrganisationsArgs
    organisationAdmins?: boolean | GlobalUserCountOutputTypeCountOrganisationAdminsArgs
    auditLogs?: boolean | GlobalUserCountOutputTypeCountAuditLogsArgs
  }

  // Custom InputTypes
  /**
   * GlobalUserCountOutputType without action
   */
  export type GlobalUserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalUserCountOutputType
     */
    select?: GlobalUserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * GlobalUserCountOutputType without action
   */
  export type GlobalUserCountOutputTypeCountOrganisationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrganisationWhereInput
  }

  /**
   * GlobalUserCountOutputType without action
   */
  export type GlobalUserCountOutputTypeCountOrganisationAdminsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrganisationAdminWhereInput
  }

  /**
   * GlobalUserCountOutputType without action
   */
  export type GlobalUserCountOutputTypeCountAuditLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuditLogWhereInput
  }


  /**
   * Count Type OrganisationCountOutputType
   */

  export type OrganisationCountOutputType = {
    admins: number
  }

  export type OrganisationCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    admins?: boolean | OrganisationCountOutputTypeCountAdminsArgs
  }

  // Custom InputTypes
  /**
   * OrganisationCountOutputType without action
   */
  export type OrganisationCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganisationCountOutputType
     */
    select?: OrganisationCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OrganisationCountOutputType without action
   */
  export type OrganisationCountOutputTypeCountAdminsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrganisationAdminWhereInput
  }


  /**
   * Count Type OrgUserCountOutputType
   */

  export type OrgUserCountOutputType = {
    roles: number
    auditLogs: number
  }

  export type OrgUserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    roles?: boolean | OrgUserCountOutputTypeCountRolesArgs
    auditLogs?: boolean | OrgUserCountOutputTypeCountAuditLogsArgs
  }

  // Custom InputTypes
  /**
   * OrgUserCountOutputType without action
   */
  export type OrgUserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgUserCountOutputType
     */
    select?: OrgUserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OrgUserCountOutputType without action
   */
  export type OrgUserCountOutputTypeCountRolesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrgUserRoleWhereInput
  }

  /**
   * OrgUserCountOutputType without action
   */
  export type OrgUserCountOutputTypeCountAuditLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuditLogWhereInput
  }


  /**
   * Count Type RoleCountOutputType
   */

  export type RoleCountOutputType = {
    permissions: number
    users: number
  }

  export type RoleCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    permissions?: boolean | RoleCountOutputTypeCountPermissionsArgs
    users?: boolean | RoleCountOutputTypeCountUsersArgs
  }

  // Custom InputTypes
  /**
   * RoleCountOutputType without action
   */
  export type RoleCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoleCountOutputType
     */
    select?: RoleCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * RoleCountOutputType without action
   */
  export type RoleCountOutputTypeCountPermissionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RolePermissionWhereInput
  }

  /**
   * RoleCountOutputType without action
   */
  export type RoleCountOutputTypeCountUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrgUserRoleWhereInput
  }


  /**
   * Count Type PermissionCountOutputType
   */

  export type PermissionCountOutputType = {
    roles: number
  }

  export type PermissionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    roles?: boolean | PermissionCountOutputTypeCountRolesArgs
  }

  // Custom InputTypes
  /**
   * PermissionCountOutputType without action
   */
  export type PermissionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PermissionCountOutputType
     */
    select?: PermissionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PermissionCountOutputType without action
   */
  export type PermissionCountOutputTypeCountRolesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RolePermissionWhereInput
  }


  /**
   * Models
   */

  /**
   * Model GlobalUser
   */

  export type AggregateGlobalUser = {
    _count: GlobalUserCountAggregateOutputType | null
    _min: GlobalUserMinAggregateOutputType | null
    _max: GlobalUserMaxAggregateOutputType | null
  }

  export type GlobalUserMinAggregateOutputType = {
    id: string | null
    email: string | null
    passwordHash: string | null
    totpSecret: string | null
    isTotpEnabled: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GlobalUserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    passwordHash: string | null
    totpSecret: string | null
    isTotpEnabled: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GlobalUserCountAggregateOutputType = {
    id: number
    email: number
    passwordHash: number
    totpSecret: number
    isTotpEnabled: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type GlobalUserMinAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    totpSecret?: true
    isTotpEnabled?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GlobalUserMaxAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    totpSecret?: true
    isTotpEnabled?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GlobalUserCountAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    totpSecret?: true
    isTotpEnabled?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type GlobalUserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GlobalUser to aggregate.
     */
    where?: GlobalUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GlobalUsers to fetch.
     */
    orderBy?: GlobalUserOrderByWithRelationInput | GlobalUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GlobalUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GlobalUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GlobalUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GlobalUsers
    **/
    _count?: true | GlobalUserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GlobalUserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GlobalUserMaxAggregateInputType
  }

  export type GetGlobalUserAggregateType<T extends GlobalUserAggregateArgs> = {
        [P in keyof T & keyof AggregateGlobalUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGlobalUser[P]>
      : GetScalarType<T[P], AggregateGlobalUser[P]>
  }




  export type GlobalUserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GlobalUserWhereInput
    orderBy?: GlobalUserOrderByWithAggregationInput | GlobalUserOrderByWithAggregationInput[]
    by: GlobalUserScalarFieldEnum[] | GlobalUserScalarFieldEnum
    having?: GlobalUserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GlobalUserCountAggregateInputType | true
    _min?: GlobalUserMinAggregateInputType
    _max?: GlobalUserMaxAggregateInputType
  }

  export type GlobalUserGroupByOutputType = {
    id: string
    email: string
    passwordHash: string
    totpSecret: string | null
    isTotpEnabled: boolean
    createdAt: Date
    updatedAt: Date
    _count: GlobalUserCountAggregateOutputType | null
    _min: GlobalUserMinAggregateOutputType | null
    _max: GlobalUserMaxAggregateOutputType | null
  }

  type GetGlobalUserGroupByPayload<T extends GlobalUserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GlobalUserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GlobalUserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GlobalUserGroupByOutputType[P]>
            : GetScalarType<T[P], GlobalUserGroupByOutputType[P]>
        }
      >
    >


  export type GlobalUserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    totpSecret?: boolean
    isTotpEnabled?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organisations?: boolean | GlobalUser$organisationsArgs<ExtArgs>
    organisationAdmins?: boolean | GlobalUser$organisationAdminsArgs<ExtArgs>
    auditLogs?: boolean | GlobalUser$auditLogsArgs<ExtArgs>
    _count?: boolean | GlobalUserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["globalUser"]>

  export type GlobalUserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    totpSecret?: boolean
    isTotpEnabled?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["globalUser"]>

  export type GlobalUserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    totpSecret?: boolean
    isTotpEnabled?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["globalUser"]>

  export type GlobalUserSelectScalar = {
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    totpSecret?: boolean
    isTotpEnabled?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type GlobalUserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "passwordHash" | "totpSecret" | "isTotpEnabled" | "createdAt" | "updatedAt", ExtArgs["result"]["globalUser"]>
  export type GlobalUserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organisations?: boolean | GlobalUser$organisationsArgs<ExtArgs>
    organisationAdmins?: boolean | GlobalUser$organisationAdminsArgs<ExtArgs>
    auditLogs?: boolean | GlobalUser$auditLogsArgs<ExtArgs>
    _count?: boolean | GlobalUserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type GlobalUserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type GlobalUserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $GlobalUserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GlobalUser"
    objects: {
      organisations: Prisma.$OrganisationPayload<ExtArgs>[]
      organisationAdmins: Prisma.$OrganisationAdminPayload<ExtArgs>[]
      auditLogs: Prisma.$AuditLogPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      passwordHash: string
      totpSecret: string | null
      isTotpEnabled: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["globalUser"]>
    composites: {}
  }

  type GlobalUserGetPayload<S extends boolean | null | undefined | GlobalUserDefaultArgs> = $Result.GetResult<Prisma.$GlobalUserPayload, S>

  type GlobalUserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<GlobalUserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: GlobalUserCountAggregateInputType | true
    }

  export interface GlobalUserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GlobalUser'], meta: { name: 'GlobalUser' } }
    /**
     * Find zero or one GlobalUser that matches the filter.
     * @param {GlobalUserFindUniqueArgs} args - Arguments to find a GlobalUser
     * @example
     * // Get one GlobalUser
     * const globalUser = await prisma.globalUser.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GlobalUserFindUniqueArgs>(args: SelectSubset<T, GlobalUserFindUniqueArgs<ExtArgs>>): Prisma__GlobalUserClient<$Result.GetResult<Prisma.$GlobalUserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one GlobalUser that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GlobalUserFindUniqueOrThrowArgs} args - Arguments to find a GlobalUser
     * @example
     * // Get one GlobalUser
     * const globalUser = await prisma.globalUser.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GlobalUserFindUniqueOrThrowArgs>(args: SelectSubset<T, GlobalUserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GlobalUserClient<$Result.GetResult<Prisma.$GlobalUserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GlobalUser that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GlobalUserFindFirstArgs} args - Arguments to find a GlobalUser
     * @example
     * // Get one GlobalUser
     * const globalUser = await prisma.globalUser.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GlobalUserFindFirstArgs>(args?: SelectSubset<T, GlobalUserFindFirstArgs<ExtArgs>>): Prisma__GlobalUserClient<$Result.GetResult<Prisma.$GlobalUserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GlobalUser that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GlobalUserFindFirstOrThrowArgs} args - Arguments to find a GlobalUser
     * @example
     * // Get one GlobalUser
     * const globalUser = await prisma.globalUser.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GlobalUserFindFirstOrThrowArgs>(args?: SelectSubset<T, GlobalUserFindFirstOrThrowArgs<ExtArgs>>): Prisma__GlobalUserClient<$Result.GetResult<Prisma.$GlobalUserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more GlobalUsers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GlobalUserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GlobalUsers
     * const globalUsers = await prisma.globalUser.findMany()
     * 
     * // Get first 10 GlobalUsers
     * const globalUsers = await prisma.globalUser.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const globalUserWithIdOnly = await prisma.globalUser.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GlobalUserFindManyArgs>(args?: SelectSubset<T, GlobalUserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GlobalUserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a GlobalUser.
     * @param {GlobalUserCreateArgs} args - Arguments to create a GlobalUser.
     * @example
     * // Create one GlobalUser
     * const GlobalUser = await prisma.globalUser.create({
     *   data: {
     *     // ... data to create a GlobalUser
     *   }
     * })
     * 
     */
    create<T extends GlobalUserCreateArgs>(args: SelectSubset<T, GlobalUserCreateArgs<ExtArgs>>): Prisma__GlobalUserClient<$Result.GetResult<Prisma.$GlobalUserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many GlobalUsers.
     * @param {GlobalUserCreateManyArgs} args - Arguments to create many GlobalUsers.
     * @example
     * // Create many GlobalUsers
     * const globalUser = await prisma.globalUser.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GlobalUserCreateManyArgs>(args?: SelectSubset<T, GlobalUserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many GlobalUsers and returns the data saved in the database.
     * @param {GlobalUserCreateManyAndReturnArgs} args - Arguments to create many GlobalUsers.
     * @example
     * // Create many GlobalUsers
     * const globalUser = await prisma.globalUser.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many GlobalUsers and only return the `id`
     * const globalUserWithIdOnly = await prisma.globalUser.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GlobalUserCreateManyAndReturnArgs>(args?: SelectSubset<T, GlobalUserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GlobalUserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a GlobalUser.
     * @param {GlobalUserDeleteArgs} args - Arguments to delete one GlobalUser.
     * @example
     * // Delete one GlobalUser
     * const GlobalUser = await prisma.globalUser.delete({
     *   where: {
     *     // ... filter to delete one GlobalUser
     *   }
     * })
     * 
     */
    delete<T extends GlobalUserDeleteArgs>(args: SelectSubset<T, GlobalUserDeleteArgs<ExtArgs>>): Prisma__GlobalUserClient<$Result.GetResult<Prisma.$GlobalUserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one GlobalUser.
     * @param {GlobalUserUpdateArgs} args - Arguments to update one GlobalUser.
     * @example
     * // Update one GlobalUser
     * const globalUser = await prisma.globalUser.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GlobalUserUpdateArgs>(args: SelectSubset<T, GlobalUserUpdateArgs<ExtArgs>>): Prisma__GlobalUserClient<$Result.GetResult<Prisma.$GlobalUserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more GlobalUsers.
     * @param {GlobalUserDeleteManyArgs} args - Arguments to filter GlobalUsers to delete.
     * @example
     * // Delete a few GlobalUsers
     * const { count } = await prisma.globalUser.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GlobalUserDeleteManyArgs>(args?: SelectSubset<T, GlobalUserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GlobalUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GlobalUserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GlobalUsers
     * const globalUser = await prisma.globalUser.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GlobalUserUpdateManyArgs>(args: SelectSubset<T, GlobalUserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GlobalUsers and returns the data updated in the database.
     * @param {GlobalUserUpdateManyAndReturnArgs} args - Arguments to update many GlobalUsers.
     * @example
     * // Update many GlobalUsers
     * const globalUser = await prisma.globalUser.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more GlobalUsers and only return the `id`
     * const globalUserWithIdOnly = await prisma.globalUser.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends GlobalUserUpdateManyAndReturnArgs>(args: SelectSubset<T, GlobalUserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GlobalUserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one GlobalUser.
     * @param {GlobalUserUpsertArgs} args - Arguments to update or create a GlobalUser.
     * @example
     * // Update or create a GlobalUser
     * const globalUser = await prisma.globalUser.upsert({
     *   create: {
     *     // ... data to create a GlobalUser
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GlobalUser we want to update
     *   }
     * })
     */
    upsert<T extends GlobalUserUpsertArgs>(args: SelectSubset<T, GlobalUserUpsertArgs<ExtArgs>>): Prisma__GlobalUserClient<$Result.GetResult<Prisma.$GlobalUserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of GlobalUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GlobalUserCountArgs} args - Arguments to filter GlobalUsers to count.
     * @example
     * // Count the number of GlobalUsers
     * const count = await prisma.globalUser.count({
     *   where: {
     *     // ... the filter for the GlobalUsers we want to count
     *   }
     * })
    **/
    count<T extends GlobalUserCountArgs>(
      args?: Subset<T, GlobalUserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GlobalUserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GlobalUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GlobalUserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GlobalUserAggregateArgs>(args: Subset<T, GlobalUserAggregateArgs>): Prisma.PrismaPromise<GetGlobalUserAggregateType<T>>

    /**
     * Group by GlobalUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GlobalUserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GlobalUserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GlobalUserGroupByArgs['orderBy'] }
        : { orderBy?: GlobalUserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GlobalUserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGlobalUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GlobalUser model
   */
  readonly fields: GlobalUserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GlobalUser.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GlobalUserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    organisations<T extends GlobalUser$organisationsArgs<ExtArgs> = {}>(args?: Subset<T, GlobalUser$organisationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganisationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    organisationAdmins<T extends GlobalUser$organisationAdminsArgs<ExtArgs> = {}>(args?: Subset<T, GlobalUser$organisationAdminsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganisationAdminPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    auditLogs<T extends GlobalUser$auditLogsArgs<ExtArgs> = {}>(args?: Subset<T, GlobalUser$auditLogsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the GlobalUser model
   */
  interface GlobalUserFieldRefs {
    readonly id: FieldRef<"GlobalUser", 'String'>
    readonly email: FieldRef<"GlobalUser", 'String'>
    readonly passwordHash: FieldRef<"GlobalUser", 'String'>
    readonly totpSecret: FieldRef<"GlobalUser", 'String'>
    readonly isTotpEnabled: FieldRef<"GlobalUser", 'Boolean'>
    readonly createdAt: FieldRef<"GlobalUser", 'DateTime'>
    readonly updatedAt: FieldRef<"GlobalUser", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * GlobalUser findUnique
   */
  export type GlobalUserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalUser
     */
    select?: GlobalUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GlobalUser
     */
    omit?: GlobalUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GlobalUserInclude<ExtArgs> | null
    /**
     * Filter, which GlobalUser to fetch.
     */
    where: GlobalUserWhereUniqueInput
  }

  /**
   * GlobalUser findUniqueOrThrow
   */
  export type GlobalUserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalUser
     */
    select?: GlobalUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GlobalUser
     */
    omit?: GlobalUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GlobalUserInclude<ExtArgs> | null
    /**
     * Filter, which GlobalUser to fetch.
     */
    where: GlobalUserWhereUniqueInput
  }

  /**
   * GlobalUser findFirst
   */
  export type GlobalUserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalUser
     */
    select?: GlobalUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GlobalUser
     */
    omit?: GlobalUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GlobalUserInclude<ExtArgs> | null
    /**
     * Filter, which GlobalUser to fetch.
     */
    where?: GlobalUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GlobalUsers to fetch.
     */
    orderBy?: GlobalUserOrderByWithRelationInput | GlobalUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GlobalUsers.
     */
    cursor?: GlobalUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GlobalUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GlobalUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GlobalUsers.
     */
    distinct?: GlobalUserScalarFieldEnum | GlobalUserScalarFieldEnum[]
  }

  /**
   * GlobalUser findFirstOrThrow
   */
  export type GlobalUserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalUser
     */
    select?: GlobalUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GlobalUser
     */
    omit?: GlobalUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GlobalUserInclude<ExtArgs> | null
    /**
     * Filter, which GlobalUser to fetch.
     */
    where?: GlobalUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GlobalUsers to fetch.
     */
    orderBy?: GlobalUserOrderByWithRelationInput | GlobalUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GlobalUsers.
     */
    cursor?: GlobalUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GlobalUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GlobalUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GlobalUsers.
     */
    distinct?: GlobalUserScalarFieldEnum | GlobalUserScalarFieldEnum[]
  }

  /**
   * GlobalUser findMany
   */
  export type GlobalUserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalUser
     */
    select?: GlobalUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GlobalUser
     */
    omit?: GlobalUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GlobalUserInclude<ExtArgs> | null
    /**
     * Filter, which GlobalUsers to fetch.
     */
    where?: GlobalUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GlobalUsers to fetch.
     */
    orderBy?: GlobalUserOrderByWithRelationInput | GlobalUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GlobalUsers.
     */
    cursor?: GlobalUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GlobalUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GlobalUsers.
     */
    skip?: number
    distinct?: GlobalUserScalarFieldEnum | GlobalUserScalarFieldEnum[]
  }

  /**
   * GlobalUser create
   */
  export type GlobalUserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalUser
     */
    select?: GlobalUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GlobalUser
     */
    omit?: GlobalUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GlobalUserInclude<ExtArgs> | null
    /**
     * The data needed to create a GlobalUser.
     */
    data: XOR<GlobalUserCreateInput, GlobalUserUncheckedCreateInput>
  }

  /**
   * GlobalUser createMany
   */
  export type GlobalUserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GlobalUsers.
     */
    data: GlobalUserCreateManyInput | GlobalUserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GlobalUser createManyAndReturn
   */
  export type GlobalUserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalUser
     */
    select?: GlobalUserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the GlobalUser
     */
    omit?: GlobalUserOmit<ExtArgs> | null
    /**
     * The data used to create many GlobalUsers.
     */
    data: GlobalUserCreateManyInput | GlobalUserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GlobalUser update
   */
  export type GlobalUserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalUser
     */
    select?: GlobalUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GlobalUser
     */
    omit?: GlobalUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GlobalUserInclude<ExtArgs> | null
    /**
     * The data needed to update a GlobalUser.
     */
    data: XOR<GlobalUserUpdateInput, GlobalUserUncheckedUpdateInput>
    /**
     * Choose, which GlobalUser to update.
     */
    where: GlobalUserWhereUniqueInput
  }

  /**
   * GlobalUser updateMany
   */
  export type GlobalUserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GlobalUsers.
     */
    data: XOR<GlobalUserUpdateManyMutationInput, GlobalUserUncheckedUpdateManyInput>
    /**
     * Filter which GlobalUsers to update
     */
    where?: GlobalUserWhereInput
    /**
     * Limit how many GlobalUsers to update.
     */
    limit?: number
  }

  /**
   * GlobalUser updateManyAndReturn
   */
  export type GlobalUserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalUser
     */
    select?: GlobalUserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the GlobalUser
     */
    omit?: GlobalUserOmit<ExtArgs> | null
    /**
     * The data used to update GlobalUsers.
     */
    data: XOR<GlobalUserUpdateManyMutationInput, GlobalUserUncheckedUpdateManyInput>
    /**
     * Filter which GlobalUsers to update
     */
    where?: GlobalUserWhereInput
    /**
     * Limit how many GlobalUsers to update.
     */
    limit?: number
  }

  /**
   * GlobalUser upsert
   */
  export type GlobalUserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalUser
     */
    select?: GlobalUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GlobalUser
     */
    omit?: GlobalUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GlobalUserInclude<ExtArgs> | null
    /**
     * The filter to search for the GlobalUser to update in case it exists.
     */
    where: GlobalUserWhereUniqueInput
    /**
     * In case the GlobalUser found by the `where` argument doesn't exist, create a new GlobalUser with this data.
     */
    create: XOR<GlobalUserCreateInput, GlobalUserUncheckedCreateInput>
    /**
     * In case the GlobalUser was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GlobalUserUpdateInput, GlobalUserUncheckedUpdateInput>
  }

  /**
   * GlobalUser delete
   */
  export type GlobalUserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalUser
     */
    select?: GlobalUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GlobalUser
     */
    omit?: GlobalUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GlobalUserInclude<ExtArgs> | null
    /**
     * Filter which GlobalUser to delete.
     */
    where: GlobalUserWhereUniqueInput
  }

  /**
   * GlobalUser deleteMany
   */
  export type GlobalUserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GlobalUsers to delete
     */
    where?: GlobalUserWhereInput
    /**
     * Limit how many GlobalUsers to delete.
     */
    limit?: number
  }

  /**
   * GlobalUser.organisations
   */
  export type GlobalUser$organisationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organisation
     */
    select?: OrganisationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organisation
     */
    omit?: OrganisationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganisationInclude<ExtArgs> | null
    where?: OrganisationWhereInput
    orderBy?: OrganisationOrderByWithRelationInput | OrganisationOrderByWithRelationInput[]
    cursor?: OrganisationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrganisationScalarFieldEnum | OrganisationScalarFieldEnum[]
  }

  /**
   * GlobalUser.organisationAdmins
   */
  export type GlobalUser$organisationAdminsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganisationAdmin
     */
    select?: OrganisationAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganisationAdmin
     */
    omit?: OrganisationAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganisationAdminInclude<ExtArgs> | null
    where?: OrganisationAdminWhereInput
    orderBy?: OrganisationAdminOrderByWithRelationInput | OrganisationAdminOrderByWithRelationInput[]
    cursor?: OrganisationAdminWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrganisationAdminScalarFieldEnum | OrganisationAdminScalarFieldEnum[]
  }

  /**
   * GlobalUser.auditLogs
   */
  export type GlobalUser$auditLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    where?: AuditLogWhereInput
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    cursor?: AuditLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * GlobalUser without action
   */
  export type GlobalUserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalUser
     */
    select?: GlobalUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GlobalUser
     */
    omit?: GlobalUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GlobalUserInclude<ExtArgs> | null
  }


  /**
   * Model Organisation
   */

  export type AggregateOrganisation = {
    _count: OrganisationCountAggregateOutputType | null
    _min: OrganisationMinAggregateOutputType | null
    _max: OrganisationMaxAggregateOutputType | null
  }

  export type OrganisationMinAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    ownerId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrganisationMaxAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    ownerId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrganisationCountAggregateOutputType = {
    id: number
    name: number
    slug: number
    branding: number
    features: number
    ownerId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OrganisationMinAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    ownerId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrganisationMaxAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    ownerId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrganisationCountAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    branding?: true
    features?: true
    ownerId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OrganisationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Organisation to aggregate.
     */
    where?: OrganisationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organisations to fetch.
     */
    orderBy?: OrganisationOrderByWithRelationInput | OrganisationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrganisationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organisations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organisations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Organisations
    **/
    _count?: true | OrganisationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrganisationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrganisationMaxAggregateInputType
  }

  export type GetOrganisationAggregateType<T extends OrganisationAggregateArgs> = {
        [P in keyof T & keyof AggregateOrganisation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrganisation[P]>
      : GetScalarType<T[P], AggregateOrganisation[P]>
  }




  export type OrganisationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrganisationWhereInput
    orderBy?: OrganisationOrderByWithAggregationInput | OrganisationOrderByWithAggregationInput[]
    by: OrganisationScalarFieldEnum[] | OrganisationScalarFieldEnum
    having?: OrganisationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrganisationCountAggregateInputType | true
    _min?: OrganisationMinAggregateInputType
    _max?: OrganisationMaxAggregateInputType
  }

  export type OrganisationGroupByOutputType = {
    id: string
    name: string
    slug: string
    branding: JsonValue | null
    features: JsonValue | null
    ownerId: string
    createdAt: Date
    updatedAt: Date
    _count: OrganisationCountAggregateOutputType | null
    _min: OrganisationMinAggregateOutputType | null
    _max: OrganisationMaxAggregateOutputType | null
  }

  type GetOrganisationGroupByPayload<T extends OrganisationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrganisationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrganisationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrganisationGroupByOutputType[P]>
            : GetScalarType<T[P], OrganisationGroupByOutputType[P]>
        }
      >
    >


  export type OrganisationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    branding?: boolean
    features?: boolean
    ownerId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    owner?: boolean | GlobalUserDefaultArgs<ExtArgs>
    admins?: boolean | Organisation$adminsArgs<ExtArgs>
    _count?: boolean | OrganisationCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["organisation"]>

  export type OrganisationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    branding?: boolean
    features?: boolean
    ownerId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    owner?: boolean | GlobalUserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["organisation"]>

  export type OrganisationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    branding?: boolean
    features?: boolean
    ownerId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    owner?: boolean | GlobalUserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["organisation"]>

  export type OrganisationSelectScalar = {
    id?: boolean
    name?: boolean
    slug?: boolean
    branding?: boolean
    features?: boolean
    ownerId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OrganisationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "slug" | "branding" | "features" | "ownerId" | "createdAt" | "updatedAt", ExtArgs["result"]["organisation"]>
  export type OrganisationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    owner?: boolean | GlobalUserDefaultArgs<ExtArgs>
    admins?: boolean | Organisation$adminsArgs<ExtArgs>
    _count?: boolean | OrganisationCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OrganisationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    owner?: boolean | GlobalUserDefaultArgs<ExtArgs>
  }
  export type OrganisationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    owner?: boolean | GlobalUserDefaultArgs<ExtArgs>
  }

  export type $OrganisationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Organisation"
    objects: {
      owner: Prisma.$GlobalUserPayload<ExtArgs>
      admins: Prisma.$OrganisationAdminPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      slug: string
      branding: Prisma.JsonValue | null
      features: Prisma.JsonValue | null
      ownerId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["organisation"]>
    composites: {}
  }

  type OrganisationGetPayload<S extends boolean | null | undefined | OrganisationDefaultArgs> = $Result.GetResult<Prisma.$OrganisationPayload, S>

  type OrganisationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrganisationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrganisationCountAggregateInputType | true
    }

  export interface OrganisationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Organisation'], meta: { name: 'Organisation' } }
    /**
     * Find zero or one Organisation that matches the filter.
     * @param {OrganisationFindUniqueArgs} args - Arguments to find a Organisation
     * @example
     * // Get one Organisation
     * const organisation = await prisma.organisation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrganisationFindUniqueArgs>(args: SelectSubset<T, OrganisationFindUniqueArgs<ExtArgs>>): Prisma__OrganisationClient<$Result.GetResult<Prisma.$OrganisationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Organisation that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrganisationFindUniqueOrThrowArgs} args - Arguments to find a Organisation
     * @example
     * // Get one Organisation
     * const organisation = await prisma.organisation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrganisationFindUniqueOrThrowArgs>(args: SelectSubset<T, OrganisationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrganisationClient<$Result.GetResult<Prisma.$OrganisationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Organisation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganisationFindFirstArgs} args - Arguments to find a Organisation
     * @example
     * // Get one Organisation
     * const organisation = await prisma.organisation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrganisationFindFirstArgs>(args?: SelectSubset<T, OrganisationFindFirstArgs<ExtArgs>>): Prisma__OrganisationClient<$Result.GetResult<Prisma.$OrganisationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Organisation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganisationFindFirstOrThrowArgs} args - Arguments to find a Organisation
     * @example
     * // Get one Organisation
     * const organisation = await prisma.organisation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrganisationFindFirstOrThrowArgs>(args?: SelectSubset<T, OrganisationFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrganisationClient<$Result.GetResult<Prisma.$OrganisationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Organisations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganisationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Organisations
     * const organisations = await prisma.organisation.findMany()
     * 
     * // Get first 10 Organisations
     * const organisations = await prisma.organisation.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const organisationWithIdOnly = await prisma.organisation.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrganisationFindManyArgs>(args?: SelectSubset<T, OrganisationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganisationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Organisation.
     * @param {OrganisationCreateArgs} args - Arguments to create a Organisation.
     * @example
     * // Create one Organisation
     * const Organisation = await prisma.organisation.create({
     *   data: {
     *     // ... data to create a Organisation
     *   }
     * })
     * 
     */
    create<T extends OrganisationCreateArgs>(args: SelectSubset<T, OrganisationCreateArgs<ExtArgs>>): Prisma__OrganisationClient<$Result.GetResult<Prisma.$OrganisationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Organisations.
     * @param {OrganisationCreateManyArgs} args - Arguments to create many Organisations.
     * @example
     * // Create many Organisations
     * const organisation = await prisma.organisation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrganisationCreateManyArgs>(args?: SelectSubset<T, OrganisationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Organisations and returns the data saved in the database.
     * @param {OrganisationCreateManyAndReturnArgs} args - Arguments to create many Organisations.
     * @example
     * // Create many Organisations
     * const organisation = await prisma.organisation.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Organisations and only return the `id`
     * const organisationWithIdOnly = await prisma.organisation.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrganisationCreateManyAndReturnArgs>(args?: SelectSubset<T, OrganisationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganisationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Organisation.
     * @param {OrganisationDeleteArgs} args - Arguments to delete one Organisation.
     * @example
     * // Delete one Organisation
     * const Organisation = await prisma.organisation.delete({
     *   where: {
     *     // ... filter to delete one Organisation
     *   }
     * })
     * 
     */
    delete<T extends OrganisationDeleteArgs>(args: SelectSubset<T, OrganisationDeleteArgs<ExtArgs>>): Prisma__OrganisationClient<$Result.GetResult<Prisma.$OrganisationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Organisation.
     * @param {OrganisationUpdateArgs} args - Arguments to update one Organisation.
     * @example
     * // Update one Organisation
     * const organisation = await prisma.organisation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrganisationUpdateArgs>(args: SelectSubset<T, OrganisationUpdateArgs<ExtArgs>>): Prisma__OrganisationClient<$Result.GetResult<Prisma.$OrganisationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Organisations.
     * @param {OrganisationDeleteManyArgs} args - Arguments to filter Organisations to delete.
     * @example
     * // Delete a few Organisations
     * const { count } = await prisma.organisation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrganisationDeleteManyArgs>(args?: SelectSubset<T, OrganisationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Organisations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganisationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Organisations
     * const organisation = await prisma.organisation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrganisationUpdateManyArgs>(args: SelectSubset<T, OrganisationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Organisations and returns the data updated in the database.
     * @param {OrganisationUpdateManyAndReturnArgs} args - Arguments to update many Organisations.
     * @example
     * // Update many Organisations
     * const organisation = await prisma.organisation.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Organisations and only return the `id`
     * const organisationWithIdOnly = await prisma.organisation.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OrganisationUpdateManyAndReturnArgs>(args: SelectSubset<T, OrganisationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganisationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Organisation.
     * @param {OrganisationUpsertArgs} args - Arguments to update or create a Organisation.
     * @example
     * // Update or create a Organisation
     * const organisation = await prisma.organisation.upsert({
     *   create: {
     *     // ... data to create a Organisation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Organisation we want to update
     *   }
     * })
     */
    upsert<T extends OrganisationUpsertArgs>(args: SelectSubset<T, OrganisationUpsertArgs<ExtArgs>>): Prisma__OrganisationClient<$Result.GetResult<Prisma.$OrganisationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Organisations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganisationCountArgs} args - Arguments to filter Organisations to count.
     * @example
     * // Count the number of Organisations
     * const count = await prisma.organisation.count({
     *   where: {
     *     // ... the filter for the Organisations we want to count
     *   }
     * })
    **/
    count<T extends OrganisationCountArgs>(
      args?: Subset<T, OrganisationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrganisationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Organisation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganisationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrganisationAggregateArgs>(args: Subset<T, OrganisationAggregateArgs>): Prisma.PrismaPromise<GetOrganisationAggregateType<T>>

    /**
     * Group by Organisation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganisationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OrganisationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrganisationGroupByArgs['orderBy'] }
        : { orderBy?: OrganisationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OrganisationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrganisationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Organisation model
   */
  readonly fields: OrganisationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Organisation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrganisationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    owner<T extends GlobalUserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, GlobalUserDefaultArgs<ExtArgs>>): Prisma__GlobalUserClient<$Result.GetResult<Prisma.$GlobalUserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    admins<T extends Organisation$adminsArgs<ExtArgs> = {}>(args?: Subset<T, Organisation$adminsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganisationAdminPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Organisation model
   */
  interface OrganisationFieldRefs {
    readonly id: FieldRef<"Organisation", 'String'>
    readonly name: FieldRef<"Organisation", 'String'>
    readonly slug: FieldRef<"Organisation", 'String'>
    readonly branding: FieldRef<"Organisation", 'Json'>
    readonly features: FieldRef<"Organisation", 'Json'>
    readonly ownerId: FieldRef<"Organisation", 'String'>
    readonly createdAt: FieldRef<"Organisation", 'DateTime'>
    readonly updatedAt: FieldRef<"Organisation", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Organisation findUnique
   */
  export type OrganisationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organisation
     */
    select?: OrganisationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organisation
     */
    omit?: OrganisationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganisationInclude<ExtArgs> | null
    /**
     * Filter, which Organisation to fetch.
     */
    where: OrganisationWhereUniqueInput
  }

  /**
   * Organisation findUniqueOrThrow
   */
  export type OrganisationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organisation
     */
    select?: OrganisationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organisation
     */
    omit?: OrganisationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganisationInclude<ExtArgs> | null
    /**
     * Filter, which Organisation to fetch.
     */
    where: OrganisationWhereUniqueInput
  }

  /**
   * Organisation findFirst
   */
  export type OrganisationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organisation
     */
    select?: OrganisationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organisation
     */
    omit?: OrganisationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganisationInclude<ExtArgs> | null
    /**
     * Filter, which Organisation to fetch.
     */
    where?: OrganisationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organisations to fetch.
     */
    orderBy?: OrganisationOrderByWithRelationInput | OrganisationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Organisations.
     */
    cursor?: OrganisationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organisations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organisations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Organisations.
     */
    distinct?: OrganisationScalarFieldEnum | OrganisationScalarFieldEnum[]
  }

  /**
   * Organisation findFirstOrThrow
   */
  export type OrganisationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organisation
     */
    select?: OrganisationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organisation
     */
    omit?: OrganisationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganisationInclude<ExtArgs> | null
    /**
     * Filter, which Organisation to fetch.
     */
    where?: OrganisationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organisations to fetch.
     */
    orderBy?: OrganisationOrderByWithRelationInput | OrganisationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Organisations.
     */
    cursor?: OrganisationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organisations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organisations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Organisations.
     */
    distinct?: OrganisationScalarFieldEnum | OrganisationScalarFieldEnum[]
  }

  /**
   * Organisation findMany
   */
  export type OrganisationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organisation
     */
    select?: OrganisationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organisation
     */
    omit?: OrganisationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganisationInclude<ExtArgs> | null
    /**
     * Filter, which Organisations to fetch.
     */
    where?: OrganisationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organisations to fetch.
     */
    orderBy?: OrganisationOrderByWithRelationInput | OrganisationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Organisations.
     */
    cursor?: OrganisationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organisations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organisations.
     */
    skip?: number
    distinct?: OrganisationScalarFieldEnum | OrganisationScalarFieldEnum[]
  }

  /**
   * Organisation create
   */
  export type OrganisationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organisation
     */
    select?: OrganisationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organisation
     */
    omit?: OrganisationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganisationInclude<ExtArgs> | null
    /**
     * The data needed to create a Organisation.
     */
    data: XOR<OrganisationCreateInput, OrganisationUncheckedCreateInput>
  }

  /**
   * Organisation createMany
   */
  export type OrganisationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Organisations.
     */
    data: OrganisationCreateManyInput | OrganisationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Organisation createManyAndReturn
   */
  export type OrganisationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organisation
     */
    select?: OrganisationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Organisation
     */
    omit?: OrganisationOmit<ExtArgs> | null
    /**
     * The data used to create many Organisations.
     */
    data: OrganisationCreateManyInput | OrganisationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganisationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Organisation update
   */
  export type OrganisationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organisation
     */
    select?: OrganisationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organisation
     */
    omit?: OrganisationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganisationInclude<ExtArgs> | null
    /**
     * The data needed to update a Organisation.
     */
    data: XOR<OrganisationUpdateInput, OrganisationUncheckedUpdateInput>
    /**
     * Choose, which Organisation to update.
     */
    where: OrganisationWhereUniqueInput
  }

  /**
   * Organisation updateMany
   */
  export type OrganisationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Organisations.
     */
    data: XOR<OrganisationUpdateManyMutationInput, OrganisationUncheckedUpdateManyInput>
    /**
     * Filter which Organisations to update
     */
    where?: OrganisationWhereInput
    /**
     * Limit how many Organisations to update.
     */
    limit?: number
  }

  /**
   * Organisation updateManyAndReturn
   */
  export type OrganisationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organisation
     */
    select?: OrganisationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Organisation
     */
    omit?: OrganisationOmit<ExtArgs> | null
    /**
     * The data used to update Organisations.
     */
    data: XOR<OrganisationUpdateManyMutationInput, OrganisationUncheckedUpdateManyInput>
    /**
     * Filter which Organisations to update
     */
    where?: OrganisationWhereInput
    /**
     * Limit how many Organisations to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganisationIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Organisation upsert
   */
  export type OrganisationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organisation
     */
    select?: OrganisationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organisation
     */
    omit?: OrganisationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganisationInclude<ExtArgs> | null
    /**
     * The filter to search for the Organisation to update in case it exists.
     */
    where: OrganisationWhereUniqueInput
    /**
     * In case the Organisation found by the `where` argument doesn't exist, create a new Organisation with this data.
     */
    create: XOR<OrganisationCreateInput, OrganisationUncheckedCreateInput>
    /**
     * In case the Organisation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrganisationUpdateInput, OrganisationUncheckedUpdateInput>
  }

  /**
   * Organisation delete
   */
  export type OrganisationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organisation
     */
    select?: OrganisationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organisation
     */
    omit?: OrganisationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganisationInclude<ExtArgs> | null
    /**
     * Filter which Organisation to delete.
     */
    where: OrganisationWhereUniqueInput
  }

  /**
   * Organisation deleteMany
   */
  export type OrganisationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Organisations to delete
     */
    where?: OrganisationWhereInput
    /**
     * Limit how many Organisations to delete.
     */
    limit?: number
  }

  /**
   * Organisation.admins
   */
  export type Organisation$adminsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganisationAdmin
     */
    select?: OrganisationAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganisationAdmin
     */
    omit?: OrganisationAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganisationAdminInclude<ExtArgs> | null
    where?: OrganisationAdminWhereInput
    orderBy?: OrganisationAdminOrderByWithRelationInput | OrganisationAdminOrderByWithRelationInput[]
    cursor?: OrganisationAdminWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrganisationAdminScalarFieldEnum | OrganisationAdminScalarFieldEnum[]
  }

  /**
   * Organisation without action
   */
  export type OrganisationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organisation
     */
    select?: OrganisationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organisation
     */
    omit?: OrganisationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganisationInclude<ExtArgs> | null
  }


  /**
   * Model OrganisationAdmin
   */

  export type AggregateOrganisationAdmin = {
    _count: OrganisationAdminCountAggregateOutputType | null
    _min: OrganisationAdminMinAggregateOutputType | null
    _max: OrganisationAdminMaxAggregateOutputType | null
  }

  export type OrganisationAdminMinAggregateOutputType = {
    id: string | null
    organisationId: string | null
    globalUserId: string | null
    role: string | null
    createdAt: Date | null
  }

  export type OrganisationAdminMaxAggregateOutputType = {
    id: string | null
    organisationId: string | null
    globalUserId: string | null
    role: string | null
    createdAt: Date | null
  }

  export type OrganisationAdminCountAggregateOutputType = {
    id: number
    organisationId: number
    globalUserId: number
    role: number
    createdAt: number
    _all: number
  }


  export type OrganisationAdminMinAggregateInputType = {
    id?: true
    organisationId?: true
    globalUserId?: true
    role?: true
    createdAt?: true
  }

  export type OrganisationAdminMaxAggregateInputType = {
    id?: true
    organisationId?: true
    globalUserId?: true
    role?: true
    createdAt?: true
  }

  export type OrganisationAdminCountAggregateInputType = {
    id?: true
    organisationId?: true
    globalUserId?: true
    role?: true
    createdAt?: true
    _all?: true
  }

  export type OrganisationAdminAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrganisationAdmin to aggregate.
     */
    where?: OrganisationAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrganisationAdmins to fetch.
     */
    orderBy?: OrganisationAdminOrderByWithRelationInput | OrganisationAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrganisationAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrganisationAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrganisationAdmins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OrganisationAdmins
    **/
    _count?: true | OrganisationAdminCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrganisationAdminMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrganisationAdminMaxAggregateInputType
  }

  export type GetOrganisationAdminAggregateType<T extends OrganisationAdminAggregateArgs> = {
        [P in keyof T & keyof AggregateOrganisationAdmin]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrganisationAdmin[P]>
      : GetScalarType<T[P], AggregateOrganisationAdmin[P]>
  }




  export type OrganisationAdminGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrganisationAdminWhereInput
    orderBy?: OrganisationAdminOrderByWithAggregationInput | OrganisationAdminOrderByWithAggregationInput[]
    by: OrganisationAdminScalarFieldEnum[] | OrganisationAdminScalarFieldEnum
    having?: OrganisationAdminScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrganisationAdminCountAggregateInputType | true
    _min?: OrganisationAdminMinAggregateInputType
    _max?: OrganisationAdminMaxAggregateInputType
  }

  export type OrganisationAdminGroupByOutputType = {
    id: string
    organisationId: string
    globalUserId: string
    role: string
    createdAt: Date
    _count: OrganisationAdminCountAggregateOutputType | null
    _min: OrganisationAdminMinAggregateOutputType | null
    _max: OrganisationAdminMaxAggregateOutputType | null
  }

  type GetOrganisationAdminGroupByPayload<T extends OrganisationAdminGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrganisationAdminGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrganisationAdminGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrganisationAdminGroupByOutputType[P]>
            : GetScalarType<T[P], OrganisationAdminGroupByOutputType[P]>
        }
      >
    >


  export type OrganisationAdminSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organisationId?: boolean
    globalUserId?: boolean
    role?: boolean
    createdAt?: boolean
    organisation?: boolean | OrganisationDefaultArgs<ExtArgs>
    globalUser?: boolean | GlobalUserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["organisationAdmin"]>

  export type OrganisationAdminSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organisationId?: boolean
    globalUserId?: boolean
    role?: boolean
    createdAt?: boolean
    organisation?: boolean | OrganisationDefaultArgs<ExtArgs>
    globalUser?: boolean | GlobalUserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["organisationAdmin"]>

  export type OrganisationAdminSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organisationId?: boolean
    globalUserId?: boolean
    role?: boolean
    createdAt?: boolean
    organisation?: boolean | OrganisationDefaultArgs<ExtArgs>
    globalUser?: boolean | GlobalUserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["organisationAdmin"]>

  export type OrganisationAdminSelectScalar = {
    id?: boolean
    organisationId?: boolean
    globalUserId?: boolean
    role?: boolean
    createdAt?: boolean
  }

  export type OrganisationAdminOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "organisationId" | "globalUserId" | "role" | "createdAt", ExtArgs["result"]["organisationAdmin"]>
  export type OrganisationAdminInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organisation?: boolean | OrganisationDefaultArgs<ExtArgs>
    globalUser?: boolean | GlobalUserDefaultArgs<ExtArgs>
  }
  export type OrganisationAdminIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organisation?: boolean | OrganisationDefaultArgs<ExtArgs>
    globalUser?: boolean | GlobalUserDefaultArgs<ExtArgs>
  }
  export type OrganisationAdminIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organisation?: boolean | OrganisationDefaultArgs<ExtArgs>
    globalUser?: boolean | GlobalUserDefaultArgs<ExtArgs>
  }

  export type $OrganisationAdminPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OrganisationAdmin"
    objects: {
      organisation: Prisma.$OrganisationPayload<ExtArgs>
      globalUser: Prisma.$GlobalUserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      organisationId: string
      globalUserId: string
      role: string
      createdAt: Date
    }, ExtArgs["result"]["organisationAdmin"]>
    composites: {}
  }

  type OrganisationAdminGetPayload<S extends boolean | null | undefined | OrganisationAdminDefaultArgs> = $Result.GetResult<Prisma.$OrganisationAdminPayload, S>

  type OrganisationAdminCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrganisationAdminFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrganisationAdminCountAggregateInputType | true
    }

  export interface OrganisationAdminDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OrganisationAdmin'], meta: { name: 'OrganisationAdmin' } }
    /**
     * Find zero or one OrganisationAdmin that matches the filter.
     * @param {OrganisationAdminFindUniqueArgs} args - Arguments to find a OrganisationAdmin
     * @example
     * // Get one OrganisationAdmin
     * const organisationAdmin = await prisma.organisationAdmin.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrganisationAdminFindUniqueArgs>(args: SelectSubset<T, OrganisationAdminFindUniqueArgs<ExtArgs>>): Prisma__OrganisationAdminClient<$Result.GetResult<Prisma.$OrganisationAdminPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OrganisationAdmin that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrganisationAdminFindUniqueOrThrowArgs} args - Arguments to find a OrganisationAdmin
     * @example
     * // Get one OrganisationAdmin
     * const organisationAdmin = await prisma.organisationAdmin.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrganisationAdminFindUniqueOrThrowArgs>(args: SelectSubset<T, OrganisationAdminFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrganisationAdminClient<$Result.GetResult<Prisma.$OrganisationAdminPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrganisationAdmin that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganisationAdminFindFirstArgs} args - Arguments to find a OrganisationAdmin
     * @example
     * // Get one OrganisationAdmin
     * const organisationAdmin = await prisma.organisationAdmin.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrganisationAdminFindFirstArgs>(args?: SelectSubset<T, OrganisationAdminFindFirstArgs<ExtArgs>>): Prisma__OrganisationAdminClient<$Result.GetResult<Prisma.$OrganisationAdminPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrganisationAdmin that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganisationAdminFindFirstOrThrowArgs} args - Arguments to find a OrganisationAdmin
     * @example
     * // Get one OrganisationAdmin
     * const organisationAdmin = await prisma.organisationAdmin.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrganisationAdminFindFirstOrThrowArgs>(args?: SelectSubset<T, OrganisationAdminFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrganisationAdminClient<$Result.GetResult<Prisma.$OrganisationAdminPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OrganisationAdmins that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganisationAdminFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OrganisationAdmins
     * const organisationAdmins = await prisma.organisationAdmin.findMany()
     * 
     * // Get first 10 OrganisationAdmins
     * const organisationAdmins = await prisma.organisationAdmin.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const organisationAdminWithIdOnly = await prisma.organisationAdmin.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrganisationAdminFindManyArgs>(args?: SelectSubset<T, OrganisationAdminFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganisationAdminPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OrganisationAdmin.
     * @param {OrganisationAdminCreateArgs} args - Arguments to create a OrganisationAdmin.
     * @example
     * // Create one OrganisationAdmin
     * const OrganisationAdmin = await prisma.organisationAdmin.create({
     *   data: {
     *     // ... data to create a OrganisationAdmin
     *   }
     * })
     * 
     */
    create<T extends OrganisationAdminCreateArgs>(args: SelectSubset<T, OrganisationAdminCreateArgs<ExtArgs>>): Prisma__OrganisationAdminClient<$Result.GetResult<Prisma.$OrganisationAdminPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OrganisationAdmins.
     * @param {OrganisationAdminCreateManyArgs} args - Arguments to create many OrganisationAdmins.
     * @example
     * // Create many OrganisationAdmins
     * const organisationAdmin = await prisma.organisationAdmin.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrganisationAdminCreateManyArgs>(args?: SelectSubset<T, OrganisationAdminCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OrganisationAdmins and returns the data saved in the database.
     * @param {OrganisationAdminCreateManyAndReturnArgs} args - Arguments to create many OrganisationAdmins.
     * @example
     * // Create many OrganisationAdmins
     * const organisationAdmin = await prisma.organisationAdmin.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OrganisationAdmins and only return the `id`
     * const organisationAdminWithIdOnly = await prisma.organisationAdmin.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrganisationAdminCreateManyAndReturnArgs>(args?: SelectSubset<T, OrganisationAdminCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganisationAdminPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OrganisationAdmin.
     * @param {OrganisationAdminDeleteArgs} args - Arguments to delete one OrganisationAdmin.
     * @example
     * // Delete one OrganisationAdmin
     * const OrganisationAdmin = await prisma.organisationAdmin.delete({
     *   where: {
     *     // ... filter to delete one OrganisationAdmin
     *   }
     * })
     * 
     */
    delete<T extends OrganisationAdminDeleteArgs>(args: SelectSubset<T, OrganisationAdminDeleteArgs<ExtArgs>>): Prisma__OrganisationAdminClient<$Result.GetResult<Prisma.$OrganisationAdminPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OrganisationAdmin.
     * @param {OrganisationAdminUpdateArgs} args - Arguments to update one OrganisationAdmin.
     * @example
     * // Update one OrganisationAdmin
     * const organisationAdmin = await prisma.organisationAdmin.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrganisationAdminUpdateArgs>(args: SelectSubset<T, OrganisationAdminUpdateArgs<ExtArgs>>): Prisma__OrganisationAdminClient<$Result.GetResult<Prisma.$OrganisationAdminPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OrganisationAdmins.
     * @param {OrganisationAdminDeleteManyArgs} args - Arguments to filter OrganisationAdmins to delete.
     * @example
     * // Delete a few OrganisationAdmins
     * const { count } = await prisma.organisationAdmin.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrganisationAdminDeleteManyArgs>(args?: SelectSubset<T, OrganisationAdminDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrganisationAdmins.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganisationAdminUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OrganisationAdmins
     * const organisationAdmin = await prisma.organisationAdmin.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrganisationAdminUpdateManyArgs>(args: SelectSubset<T, OrganisationAdminUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrganisationAdmins and returns the data updated in the database.
     * @param {OrganisationAdminUpdateManyAndReturnArgs} args - Arguments to update many OrganisationAdmins.
     * @example
     * // Update many OrganisationAdmins
     * const organisationAdmin = await prisma.organisationAdmin.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OrganisationAdmins and only return the `id`
     * const organisationAdminWithIdOnly = await prisma.organisationAdmin.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OrganisationAdminUpdateManyAndReturnArgs>(args: SelectSubset<T, OrganisationAdminUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganisationAdminPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OrganisationAdmin.
     * @param {OrganisationAdminUpsertArgs} args - Arguments to update or create a OrganisationAdmin.
     * @example
     * // Update or create a OrganisationAdmin
     * const organisationAdmin = await prisma.organisationAdmin.upsert({
     *   create: {
     *     // ... data to create a OrganisationAdmin
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OrganisationAdmin we want to update
     *   }
     * })
     */
    upsert<T extends OrganisationAdminUpsertArgs>(args: SelectSubset<T, OrganisationAdminUpsertArgs<ExtArgs>>): Prisma__OrganisationAdminClient<$Result.GetResult<Prisma.$OrganisationAdminPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OrganisationAdmins.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganisationAdminCountArgs} args - Arguments to filter OrganisationAdmins to count.
     * @example
     * // Count the number of OrganisationAdmins
     * const count = await prisma.organisationAdmin.count({
     *   where: {
     *     // ... the filter for the OrganisationAdmins we want to count
     *   }
     * })
    **/
    count<T extends OrganisationAdminCountArgs>(
      args?: Subset<T, OrganisationAdminCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrganisationAdminCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OrganisationAdmin.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganisationAdminAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrganisationAdminAggregateArgs>(args: Subset<T, OrganisationAdminAggregateArgs>): Prisma.PrismaPromise<GetOrganisationAdminAggregateType<T>>

    /**
     * Group by OrganisationAdmin.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganisationAdminGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OrganisationAdminGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrganisationAdminGroupByArgs['orderBy'] }
        : { orderBy?: OrganisationAdminGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OrganisationAdminGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrganisationAdminGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OrganisationAdmin model
   */
  readonly fields: OrganisationAdminFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OrganisationAdmin.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrganisationAdminClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    organisation<T extends OrganisationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrganisationDefaultArgs<ExtArgs>>): Prisma__OrganisationClient<$Result.GetResult<Prisma.$OrganisationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    globalUser<T extends GlobalUserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, GlobalUserDefaultArgs<ExtArgs>>): Prisma__GlobalUserClient<$Result.GetResult<Prisma.$GlobalUserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OrganisationAdmin model
   */
  interface OrganisationAdminFieldRefs {
    readonly id: FieldRef<"OrganisationAdmin", 'String'>
    readonly organisationId: FieldRef<"OrganisationAdmin", 'String'>
    readonly globalUserId: FieldRef<"OrganisationAdmin", 'String'>
    readonly role: FieldRef<"OrganisationAdmin", 'String'>
    readonly createdAt: FieldRef<"OrganisationAdmin", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OrganisationAdmin findUnique
   */
  export type OrganisationAdminFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganisationAdmin
     */
    select?: OrganisationAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganisationAdmin
     */
    omit?: OrganisationAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganisationAdminInclude<ExtArgs> | null
    /**
     * Filter, which OrganisationAdmin to fetch.
     */
    where: OrganisationAdminWhereUniqueInput
  }

  /**
   * OrganisationAdmin findUniqueOrThrow
   */
  export type OrganisationAdminFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganisationAdmin
     */
    select?: OrganisationAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganisationAdmin
     */
    omit?: OrganisationAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganisationAdminInclude<ExtArgs> | null
    /**
     * Filter, which OrganisationAdmin to fetch.
     */
    where: OrganisationAdminWhereUniqueInput
  }

  /**
   * OrganisationAdmin findFirst
   */
  export type OrganisationAdminFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganisationAdmin
     */
    select?: OrganisationAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganisationAdmin
     */
    omit?: OrganisationAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganisationAdminInclude<ExtArgs> | null
    /**
     * Filter, which OrganisationAdmin to fetch.
     */
    where?: OrganisationAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrganisationAdmins to fetch.
     */
    orderBy?: OrganisationAdminOrderByWithRelationInput | OrganisationAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrganisationAdmins.
     */
    cursor?: OrganisationAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrganisationAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrganisationAdmins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrganisationAdmins.
     */
    distinct?: OrganisationAdminScalarFieldEnum | OrganisationAdminScalarFieldEnum[]
  }

  /**
   * OrganisationAdmin findFirstOrThrow
   */
  export type OrganisationAdminFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganisationAdmin
     */
    select?: OrganisationAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganisationAdmin
     */
    omit?: OrganisationAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganisationAdminInclude<ExtArgs> | null
    /**
     * Filter, which OrganisationAdmin to fetch.
     */
    where?: OrganisationAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrganisationAdmins to fetch.
     */
    orderBy?: OrganisationAdminOrderByWithRelationInput | OrganisationAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrganisationAdmins.
     */
    cursor?: OrganisationAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrganisationAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrganisationAdmins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrganisationAdmins.
     */
    distinct?: OrganisationAdminScalarFieldEnum | OrganisationAdminScalarFieldEnum[]
  }

  /**
   * OrganisationAdmin findMany
   */
  export type OrganisationAdminFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganisationAdmin
     */
    select?: OrganisationAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganisationAdmin
     */
    omit?: OrganisationAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganisationAdminInclude<ExtArgs> | null
    /**
     * Filter, which OrganisationAdmins to fetch.
     */
    where?: OrganisationAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrganisationAdmins to fetch.
     */
    orderBy?: OrganisationAdminOrderByWithRelationInput | OrganisationAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OrganisationAdmins.
     */
    cursor?: OrganisationAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrganisationAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrganisationAdmins.
     */
    skip?: number
    distinct?: OrganisationAdminScalarFieldEnum | OrganisationAdminScalarFieldEnum[]
  }

  /**
   * OrganisationAdmin create
   */
  export type OrganisationAdminCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganisationAdmin
     */
    select?: OrganisationAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganisationAdmin
     */
    omit?: OrganisationAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganisationAdminInclude<ExtArgs> | null
    /**
     * The data needed to create a OrganisationAdmin.
     */
    data: XOR<OrganisationAdminCreateInput, OrganisationAdminUncheckedCreateInput>
  }

  /**
   * OrganisationAdmin createMany
   */
  export type OrganisationAdminCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OrganisationAdmins.
     */
    data: OrganisationAdminCreateManyInput | OrganisationAdminCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OrganisationAdmin createManyAndReturn
   */
  export type OrganisationAdminCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganisationAdmin
     */
    select?: OrganisationAdminSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OrganisationAdmin
     */
    omit?: OrganisationAdminOmit<ExtArgs> | null
    /**
     * The data used to create many OrganisationAdmins.
     */
    data: OrganisationAdminCreateManyInput | OrganisationAdminCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganisationAdminIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OrganisationAdmin update
   */
  export type OrganisationAdminUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganisationAdmin
     */
    select?: OrganisationAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganisationAdmin
     */
    omit?: OrganisationAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganisationAdminInclude<ExtArgs> | null
    /**
     * The data needed to update a OrganisationAdmin.
     */
    data: XOR<OrganisationAdminUpdateInput, OrganisationAdminUncheckedUpdateInput>
    /**
     * Choose, which OrganisationAdmin to update.
     */
    where: OrganisationAdminWhereUniqueInput
  }

  /**
   * OrganisationAdmin updateMany
   */
  export type OrganisationAdminUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OrganisationAdmins.
     */
    data: XOR<OrganisationAdminUpdateManyMutationInput, OrganisationAdminUncheckedUpdateManyInput>
    /**
     * Filter which OrganisationAdmins to update
     */
    where?: OrganisationAdminWhereInput
    /**
     * Limit how many OrganisationAdmins to update.
     */
    limit?: number
  }

  /**
   * OrganisationAdmin updateManyAndReturn
   */
  export type OrganisationAdminUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganisationAdmin
     */
    select?: OrganisationAdminSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OrganisationAdmin
     */
    omit?: OrganisationAdminOmit<ExtArgs> | null
    /**
     * The data used to update OrganisationAdmins.
     */
    data: XOR<OrganisationAdminUpdateManyMutationInput, OrganisationAdminUncheckedUpdateManyInput>
    /**
     * Filter which OrganisationAdmins to update
     */
    where?: OrganisationAdminWhereInput
    /**
     * Limit how many OrganisationAdmins to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganisationAdminIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * OrganisationAdmin upsert
   */
  export type OrganisationAdminUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganisationAdmin
     */
    select?: OrganisationAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganisationAdmin
     */
    omit?: OrganisationAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganisationAdminInclude<ExtArgs> | null
    /**
     * The filter to search for the OrganisationAdmin to update in case it exists.
     */
    where: OrganisationAdminWhereUniqueInput
    /**
     * In case the OrganisationAdmin found by the `where` argument doesn't exist, create a new OrganisationAdmin with this data.
     */
    create: XOR<OrganisationAdminCreateInput, OrganisationAdminUncheckedCreateInput>
    /**
     * In case the OrganisationAdmin was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrganisationAdminUpdateInput, OrganisationAdminUncheckedUpdateInput>
  }

  /**
   * OrganisationAdmin delete
   */
  export type OrganisationAdminDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganisationAdmin
     */
    select?: OrganisationAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganisationAdmin
     */
    omit?: OrganisationAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganisationAdminInclude<ExtArgs> | null
    /**
     * Filter which OrganisationAdmin to delete.
     */
    where: OrganisationAdminWhereUniqueInput
  }

  /**
   * OrganisationAdmin deleteMany
   */
  export type OrganisationAdminDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrganisationAdmins to delete
     */
    where?: OrganisationAdminWhereInput
    /**
     * Limit how many OrganisationAdmins to delete.
     */
    limit?: number
  }

  /**
   * OrganisationAdmin without action
   */
  export type OrganisationAdminDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganisationAdmin
     */
    select?: OrganisationAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrganisationAdmin
     */
    omit?: OrganisationAdminOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganisationAdminInclude<ExtArgs> | null
  }


  /**
   * Model Note
   */

  export type AggregateNote = {
    _count: NoteCountAggregateOutputType | null
    _min: NoteMinAggregateOutputType | null
    _max: NoteMaxAggregateOutputType | null
  }

  export type NoteMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    title: string | null
    body: string | null
    createdBy: string | null
    createdAt: Date | null
  }

  export type NoteMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    title: string | null
    body: string | null
    createdBy: string | null
    createdAt: Date | null
  }

  export type NoteCountAggregateOutputType = {
    id: number
    tenantId: number
    title: number
    body: number
    createdBy: number
    createdAt: number
    _all: number
  }


  export type NoteMinAggregateInputType = {
    id?: true
    tenantId?: true
    title?: true
    body?: true
    createdBy?: true
    createdAt?: true
  }

  export type NoteMaxAggregateInputType = {
    id?: true
    tenantId?: true
    title?: true
    body?: true
    createdBy?: true
    createdAt?: true
  }

  export type NoteCountAggregateInputType = {
    id?: true
    tenantId?: true
    title?: true
    body?: true
    createdBy?: true
    createdAt?: true
    _all?: true
  }

  export type NoteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Note to aggregate.
     */
    where?: NoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notes to fetch.
     */
    orderBy?: NoteOrderByWithRelationInput | NoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: NoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Notes
    **/
    _count?: true | NoteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: NoteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: NoteMaxAggregateInputType
  }

  export type GetNoteAggregateType<T extends NoteAggregateArgs> = {
        [P in keyof T & keyof AggregateNote]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateNote[P]>
      : GetScalarType<T[P], AggregateNote[P]>
  }




  export type NoteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NoteWhereInput
    orderBy?: NoteOrderByWithAggregationInput | NoteOrderByWithAggregationInput[]
    by: NoteScalarFieldEnum[] | NoteScalarFieldEnum
    having?: NoteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: NoteCountAggregateInputType | true
    _min?: NoteMinAggregateInputType
    _max?: NoteMaxAggregateInputType
  }

  export type NoteGroupByOutputType = {
    id: string
    tenantId: string
    title: string
    body: string | null
    createdBy: string
    createdAt: Date
    _count: NoteCountAggregateOutputType | null
    _min: NoteMinAggregateOutputType | null
    _max: NoteMaxAggregateOutputType | null
  }

  type GetNoteGroupByPayload<T extends NoteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<NoteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof NoteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], NoteGroupByOutputType[P]>
            : GetScalarType<T[P], NoteGroupByOutputType[P]>
        }
      >
    >


  export type NoteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    title?: boolean
    body?: boolean
    createdBy?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["note"]>

  export type NoteSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    title?: boolean
    body?: boolean
    createdBy?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["note"]>

  export type NoteSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    title?: boolean
    body?: boolean
    createdBy?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["note"]>

  export type NoteSelectScalar = {
    id?: boolean
    tenantId?: boolean
    title?: boolean
    body?: boolean
    createdBy?: boolean
    createdAt?: boolean
  }

  export type NoteOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "title" | "body" | "createdBy" | "createdAt", ExtArgs["result"]["note"]>

  export type $NotePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Note"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      title: string
      body: string | null
      createdBy: string
      createdAt: Date
    }, ExtArgs["result"]["note"]>
    composites: {}
  }

  type NoteGetPayload<S extends boolean | null | undefined | NoteDefaultArgs> = $Result.GetResult<Prisma.$NotePayload, S>

  type NoteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<NoteFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: NoteCountAggregateInputType | true
    }

  export interface NoteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Note'], meta: { name: 'Note' } }
    /**
     * Find zero or one Note that matches the filter.
     * @param {NoteFindUniqueArgs} args - Arguments to find a Note
     * @example
     * // Get one Note
     * const note = await prisma.note.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends NoteFindUniqueArgs>(args: SelectSubset<T, NoteFindUniqueArgs<ExtArgs>>): Prisma__NoteClient<$Result.GetResult<Prisma.$NotePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Note that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {NoteFindUniqueOrThrowArgs} args - Arguments to find a Note
     * @example
     * // Get one Note
     * const note = await prisma.note.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends NoteFindUniqueOrThrowArgs>(args: SelectSubset<T, NoteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__NoteClient<$Result.GetResult<Prisma.$NotePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Note that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NoteFindFirstArgs} args - Arguments to find a Note
     * @example
     * // Get one Note
     * const note = await prisma.note.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends NoteFindFirstArgs>(args?: SelectSubset<T, NoteFindFirstArgs<ExtArgs>>): Prisma__NoteClient<$Result.GetResult<Prisma.$NotePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Note that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NoteFindFirstOrThrowArgs} args - Arguments to find a Note
     * @example
     * // Get one Note
     * const note = await prisma.note.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends NoteFindFirstOrThrowArgs>(args?: SelectSubset<T, NoteFindFirstOrThrowArgs<ExtArgs>>): Prisma__NoteClient<$Result.GetResult<Prisma.$NotePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Notes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NoteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Notes
     * const notes = await prisma.note.findMany()
     * 
     * // Get first 10 Notes
     * const notes = await prisma.note.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const noteWithIdOnly = await prisma.note.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends NoteFindManyArgs>(args?: SelectSubset<T, NoteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Note.
     * @param {NoteCreateArgs} args - Arguments to create a Note.
     * @example
     * // Create one Note
     * const Note = await prisma.note.create({
     *   data: {
     *     // ... data to create a Note
     *   }
     * })
     * 
     */
    create<T extends NoteCreateArgs>(args: SelectSubset<T, NoteCreateArgs<ExtArgs>>): Prisma__NoteClient<$Result.GetResult<Prisma.$NotePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Notes.
     * @param {NoteCreateManyArgs} args - Arguments to create many Notes.
     * @example
     * // Create many Notes
     * const note = await prisma.note.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends NoteCreateManyArgs>(args?: SelectSubset<T, NoteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Notes and returns the data saved in the database.
     * @param {NoteCreateManyAndReturnArgs} args - Arguments to create many Notes.
     * @example
     * // Create many Notes
     * const note = await prisma.note.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Notes and only return the `id`
     * const noteWithIdOnly = await prisma.note.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends NoteCreateManyAndReturnArgs>(args?: SelectSubset<T, NoteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Note.
     * @param {NoteDeleteArgs} args - Arguments to delete one Note.
     * @example
     * // Delete one Note
     * const Note = await prisma.note.delete({
     *   where: {
     *     // ... filter to delete one Note
     *   }
     * })
     * 
     */
    delete<T extends NoteDeleteArgs>(args: SelectSubset<T, NoteDeleteArgs<ExtArgs>>): Prisma__NoteClient<$Result.GetResult<Prisma.$NotePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Note.
     * @param {NoteUpdateArgs} args - Arguments to update one Note.
     * @example
     * // Update one Note
     * const note = await prisma.note.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends NoteUpdateArgs>(args: SelectSubset<T, NoteUpdateArgs<ExtArgs>>): Prisma__NoteClient<$Result.GetResult<Prisma.$NotePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Notes.
     * @param {NoteDeleteManyArgs} args - Arguments to filter Notes to delete.
     * @example
     * // Delete a few Notes
     * const { count } = await prisma.note.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends NoteDeleteManyArgs>(args?: SelectSubset<T, NoteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Notes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NoteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Notes
     * const note = await prisma.note.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends NoteUpdateManyArgs>(args: SelectSubset<T, NoteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Notes and returns the data updated in the database.
     * @param {NoteUpdateManyAndReturnArgs} args - Arguments to update many Notes.
     * @example
     * // Update many Notes
     * const note = await prisma.note.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Notes and only return the `id`
     * const noteWithIdOnly = await prisma.note.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends NoteUpdateManyAndReturnArgs>(args: SelectSubset<T, NoteUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Note.
     * @param {NoteUpsertArgs} args - Arguments to update or create a Note.
     * @example
     * // Update or create a Note
     * const note = await prisma.note.upsert({
     *   create: {
     *     // ... data to create a Note
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Note we want to update
     *   }
     * })
     */
    upsert<T extends NoteUpsertArgs>(args: SelectSubset<T, NoteUpsertArgs<ExtArgs>>): Prisma__NoteClient<$Result.GetResult<Prisma.$NotePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Notes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NoteCountArgs} args - Arguments to filter Notes to count.
     * @example
     * // Count the number of Notes
     * const count = await prisma.note.count({
     *   where: {
     *     // ... the filter for the Notes we want to count
     *   }
     * })
    **/
    count<T extends NoteCountArgs>(
      args?: Subset<T, NoteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], NoteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Note.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NoteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends NoteAggregateArgs>(args: Subset<T, NoteAggregateArgs>): Prisma.PrismaPromise<GetNoteAggregateType<T>>

    /**
     * Group by Note.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NoteGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends NoteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: NoteGroupByArgs['orderBy'] }
        : { orderBy?: NoteGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, NoteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNoteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Note model
   */
  readonly fields: NoteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Note.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__NoteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Note model
   */
  interface NoteFieldRefs {
    readonly id: FieldRef<"Note", 'String'>
    readonly tenantId: FieldRef<"Note", 'String'>
    readonly title: FieldRef<"Note", 'String'>
    readonly body: FieldRef<"Note", 'String'>
    readonly createdBy: FieldRef<"Note", 'String'>
    readonly createdAt: FieldRef<"Note", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Note findUnique
   */
  export type NoteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Note
     */
    select?: NoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Note
     */
    omit?: NoteOmit<ExtArgs> | null
    /**
     * Filter, which Note to fetch.
     */
    where: NoteWhereUniqueInput
  }

  /**
   * Note findUniqueOrThrow
   */
  export type NoteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Note
     */
    select?: NoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Note
     */
    omit?: NoteOmit<ExtArgs> | null
    /**
     * Filter, which Note to fetch.
     */
    where: NoteWhereUniqueInput
  }

  /**
   * Note findFirst
   */
  export type NoteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Note
     */
    select?: NoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Note
     */
    omit?: NoteOmit<ExtArgs> | null
    /**
     * Filter, which Note to fetch.
     */
    where?: NoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notes to fetch.
     */
    orderBy?: NoteOrderByWithRelationInput | NoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Notes.
     */
    cursor?: NoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notes.
     */
    distinct?: NoteScalarFieldEnum | NoteScalarFieldEnum[]
  }

  /**
   * Note findFirstOrThrow
   */
  export type NoteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Note
     */
    select?: NoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Note
     */
    omit?: NoteOmit<ExtArgs> | null
    /**
     * Filter, which Note to fetch.
     */
    where?: NoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notes to fetch.
     */
    orderBy?: NoteOrderByWithRelationInput | NoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Notes.
     */
    cursor?: NoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notes.
     */
    distinct?: NoteScalarFieldEnum | NoteScalarFieldEnum[]
  }

  /**
   * Note findMany
   */
  export type NoteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Note
     */
    select?: NoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Note
     */
    omit?: NoteOmit<ExtArgs> | null
    /**
     * Filter, which Notes to fetch.
     */
    where?: NoteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notes to fetch.
     */
    orderBy?: NoteOrderByWithRelationInput | NoteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Notes.
     */
    cursor?: NoteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notes.
     */
    skip?: number
    distinct?: NoteScalarFieldEnum | NoteScalarFieldEnum[]
  }

  /**
   * Note create
   */
  export type NoteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Note
     */
    select?: NoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Note
     */
    omit?: NoteOmit<ExtArgs> | null
    /**
     * The data needed to create a Note.
     */
    data: XOR<NoteCreateInput, NoteUncheckedCreateInput>
  }

  /**
   * Note createMany
   */
  export type NoteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Notes.
     */
    data: NoteCreateManyInput | NoteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Note createManyAndReturn
   */
  export type NoteCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Note
     */
    select?: NoteSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Note
     */
    omit?: NoteOmit<ExtArgs> | null
    /**
     * The data used to create many Notes.
     */
    data: NoteCreateManyInput | NoteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Note update
   */
  export type NoteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Note
     */
    select?: NoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Note
     */
    omit?: NoteOmit<ExtArgs> | null
    /**
     * The data needed to update a Note.
     */
    data: XOR<NoteUpdateInput, NoteUncheckedUpdateInput>
    /**
     * Choose, which Note to update.
     */
    where: NoteWhereUniqueInput
  }

  /**
   * Note updateMany
   */
  export type NoteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Notes.
     */
    data: XOR<NoteUpdateManyMutationInput, NoteUncheckedUpdateManyInput>
    /**
     * Filter which Notes to update
     */
    where?: NoteWhereInput
    /**
     * Limit how many Notes to update.
     */
    limit?: number
  }

  /**
   * Note updateManyAndReturn
   */
  export type NoteUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Note
     */
    select?: NoteSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Note
     */
    omit?: NoteOmit<ExtArgs> | null
    /**
     * The data used to update Notes.
     */
    data: XOR<NoteUpdateManyMutationInput, NoteUncheckedUpdateManyInput>
    /**
     * Filter which Notes to update
     */
    where?: NoteWhereInput
    /**
     * Limit how many Notes to update.
     */
    limit?: number
  }

  /**
   * Note upsert
   */
  export type NoteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Note
     */
    select?: NoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Note
     */
    omit?: NoteOmit<ExtArgs> | null
    /**
     * The filter to search for the Note to update in case it exists.
     */
    where: NoteWhereUniqueInput
    /**
     * In case the Note found by the `where` argument doesn't exist, create a new Note with this data.
     */
    create: XOR<NoteCreateInput, NoteUncheckedCreateInput>
    /**
     * In case the Note was found with the provided `where` argument, update it with this data.
     */
    update: XOR<NoteUpdateInput, NoteUncheckedUpdateInput>
  }

  /**
   * Note delete
   */
  export type NoteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Note
     */
    select?: NoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Note
     */
    omit?: NoteOmit<ExtArgs> | null
    /**
     * Filter which Note to delete.
     */
    where: NoteWhereUniqueInput
  }

  /**
   * Note deleteMany
   */
  export type NoteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Notes to delete
     */
    where?: NoteWhereInput
    /**
     * Limit how many Notes to delete.
     */
    limit?: number
  }

  /**
   * Note without action
   */
  export type NoteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Note
     */
    select?: NoteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Note
     */
    omit?: NoteOmit<ExtArgs> | null
  }


  /**
   * Model OrgUser
   */

  export type AggregateOrgUser = {
    _count: OrgUserCountAggregateOutputType | null
    _min: OrgUserMinAggregateOutputType | null
    _max: OrgUserMaxAggregateOutputType | null
  }

  export type OrgUserMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    email: string | null
    passwordHash: string | null
    displayName: string | null
    isActive: boolean | null
    totpSecret: string | null
    isTotpEnabled: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrgUserMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    email: string | null
    passwordHash: string | null
    displayName: string | null
    isActive: boolean | null
    totpSecret: string | null
    isTotpEnabled: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrgUserCountAggregateOutputType = {
    id: number
    tenantId: number
    email: number
    passwordHash: number
    displayName: number
    isActive: number
    totpSecret: number
    isTotpEnabled: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OrgUserMinAggregateInputType = {
    id?: true
    tenantId?: true
    email?: true
    passwordHash?: true
    displayName?: true
    isActive?: true
    totpSecret?: true
    isTotpEnabled?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrgUserMaxAggregateInputType = {
    id?: true
    tenantId?: true
    email?: true
    passwordHash?: true
    displayName?: true
    isActive?: true
    totpSecret?: true
    isTotpEnabled?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrgUserCountAggregateInputType = {
    id?: true
    tenantId?: true
    email?: true
    passwordHash?: true
    displayName?: true
    isActive?: true
    totpSecret?: true
    isTotpEnabled?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OrgUserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrgUser to aggregate.
     */
    where?: OrgUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrgUsers to fetch.
     */
    orderBy?: OrgUserOrderByWithRelationInput | OrgUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrgUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrgUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrgUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OrgUsers
    **/
    _count?: true | OrgUserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrgUserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrgUserMaxAggregateInputType
  }

  export type GetOrgUserAggregateType<T extends OrgUserAggregateArgs> = {
        [P in keyof T & keyof AggregateOrgUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrgUser[P]>
      : GetScalarType<T[P], AggregateOrgUser[P]>
  }




  export type OrgUserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrgUserWhereInput
    orderBy?: OrgUserOrderByWithAggregationInput | OrgUserOrderByWithAggregationInput[]
    by: OrgUserScalarFieldEnum[] | OrgUserScalarFieldEnum
    having?: OrgUserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrgUserCountAggregateInputType | true
    _min?: OrgUserMinAggregateInputType
    _max?: OrgUserMaxAggregateInputType
  }

  export type OrgUserGroupByOutputType = {
    id: string
    tenantId: string
    email: string
    passwordHash: string
    displayName: string
    isActive: boolean
    totpSecret: string | null
    isTotpEnabled: boolean
    createdAt: Date
    updatedAt: Date
    _count: OrgUserCountAggregateOutputType | null
    _min: OrgUserMinAggregateOutputType | null
    _max: OrgUserMaxAggregateOutputType | null
  }

  type GetOrgUserGroupByPayload<T extends OrgUserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrgUserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrgUserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrgUserGroupByOutputType[P]>
            : GetScalarType<T[P], OrgUserGroupByOutputType[P]>
        }
      >
    >


  export type OrgUserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    email?: boolean
    passwordHash?: boolean
    displayName?: boolean
    isActive?: boolean
    totpSecret?: boolean
    isTotpEnabled?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    roles?: boolean | OrgUser$rolesArgs<ExtArgs>
    auditLogs?: boolean | OrgUser$auditLogsArgs<ExtArgs>
    _count?: boolean | OrgUserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["orgUser"]>

  export type OrgUserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    email?: boolean
    passwordHash?: boolean
    displayName?: boolean
    isActive?: boolean
    totpSecret?: boolean
    isTotpEnabled?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["orgUser"]>

  export type OrgUserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    email?: boolean
    passwordHash?: boolean
    displayName?: boolean
    isActive?: boolean
    totpSecret?: boolean
    isTotpEnabled?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["orgUser"]>

  export type OrgUserSelectScalar = {
    id?: boolean
    tenantId?: boolean
    email?: boolean
    passwordHash?: boolean
    displayName?: boolean
    isActive?: boolean
    totpSecret?: boolean
    isTotpEnabled?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OrgUserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "email" | "passwordHash" | "displayName" | "isActive" | "totpSecret" | "isTotpEnabled" | "createdAt" | "updatedAt", ExtArgs["result"]["orgUser"]>
  export type OrgUserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    roles?: boolean | OrgUser$rolesArgs<ExtArgs>
    auditLogs?: boolean | OrgUser$auditLogsArgs<ExtArgs>
    _count?: boolean | OrgUserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OrgUserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type OrgUserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $OrgUserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OrgUser"
    objects: {
      roles: Prisma.$OrgUserRolePayload<ExtArgs>[]
      auditLogs: Prisma.$AuditLogPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      email: string
      passwordHash: string
      displayName: string
      isActive: boolean
      totpSecret: string | null
      isTotpEnabled: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["orgUser"]>
    composites: {}
  }

  type OrgUserGetPayload<S extends boolean | null | undefined | OrgUserDefaultArgs> = $Result.GetResult<Prisma.$OrgUserPayload, S>

  type OrgUserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrgUserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrgUserCountAggregateInputType | true
    }

  export interface OrgUserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OrgUser'], meta: { name: 'OrgUser' } }
    /**
     * Find zero or one OrgUser that matches the filter.
     * @param {OrgUserFindUniqueArgs} args - Arguments to find a OrgUser
     * @example
     * // Get one OrgUser
     * const orgUser = await prisma.orgUser.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrgUserFindUniqueArgs>(args: SelectSubset<T, OrgUserFindUniqueArgs<ExtArgs>>): Prisma__OrgUserClient<$Result.GetResult<Prisma.$OrgUserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OrgUser that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrgUserFindUniqueOrThrowArgs} args - Arguments to find a OrgUser
     * @example
     * // Get one OrgUser
     * const orgUser = await prisma.orgUser.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrgUserFindUniqueOrThrowArgs>(args: SelectSubset<T, OrgUserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrgUserClient<$Result.GetResult<Prisma.$OrgUserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrgUser that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgUserFindFirstArgs} args - Arguments to find a OrgUser
     * @example
     * // Get one OrgUser
     * const orgUser = await prisma.orgUser.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrgUserFindFirstArgs>(args?: SelectSubset<T, OrgUserFindFirstArgs<ExtArgs>>): Prisma__OrgUserClient<$Result.GetResult<Prisma.$OrgUserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrgUser that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgUserFindFirstOrThrowArgs} args - Arguments to find a OrgUser
     * @example
     * // Get one OrgUser
     * const orgUser = await prisma.orgUser.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrgUserFindFirstOrThrowArgs>(args?: SelectSubset<T, OrgUserFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrgUserClient<$Result.GetResult<Prisma.$OrgUserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OrgUsers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgUserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OrgUsers
     * const orgUsers = await prisma.orgUser.findMany()
     * 
     * // Get first 10 OrgUsers
     * const orgUsers = await prisma.orgUser.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const orgUserWithIdOnly = await prisma.orgUser.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrgUserFindManyArgs>(args?: SelectSubset<T, OrgUserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrgUserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OrgUser.
     * @param {OrgUserCreateArgs} args - Arguments to create a OrgUser.
     * @example
     * // Create one OrgUser
     * const OrgUser = await prisma.orgUser.create({
     *   data: {
     *     // ... data to create a OrgUser
     *   }
     * })
     * 
     */
    create<T extends OrgUserCreateArgs>(args: SelectSubset<T, OrgUserCreateArgs<ExtArgs>>): Prisma__OrgUserClient<$Result.GetResult<Prisma.$OrgUserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OrgUsers.
     * @param {OrgUserCreateManyArgs} args - Arguments to create many OrgUsers.
     * @example
     * // Create many OrgUsers
     * const orgUser = await prisma.orgUser.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrgUserCreateManyArgs>(args?: SelectSubset<T, OrgUserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OrgUsers and returns the data saved in the database.
     * @param {OrgUserCreateManyAndReturnArgs} args - Arguments to create many OrgUsers.
     * @example
     * // Create many OrgUsers
     * const orgUser = await prisma.orgUser.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OrgUsers and only return the `id`
     * const orgUserWithIdOnly = await prisma.orgUser.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrgUserCreateManyAndReturnArgs>(args?: SelectSubset<T, OrgUserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrgUserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OrgUser.
     * @param {OrgUserDeleteArgs} args - Arguments to delete one OrgUser.
     * @example
     * // Delete one OrgUser
     * const OrgUser = await prisma.orgUser.delete({
     *   where: {
     *     // ... filter to delete one OrgUser
     *   }
     * })
     * 
     */
    delete<T extends OrgUserDeleteArgs>(args: SelectSubset<T, OrgUserDeleteArgs<ExtArgs>>): Prisma__OrgUserClient<$Result.GetResult<Prisma.$OrgUserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OrgUser.
     * @param {OrgUserUpdateArgs} args - Arguments to update one OrgUser.
     * @example
     * // Update one OrgUser
     * const orgUser = await prisma.orgUser.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrgUserUpdateArgs>(args: SelectSubset<T, OrgUserUpdateArgs<ExtArgs>>): Prisma__OrgUserClient<$Result.GetResult<Prisma.$OrgUserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OrgUsers.
     * @param {OrgUserDeleteManyArgs} args - Arguments to filter OrgUsers to delete.
     * @example
     * // Delete a few OrgUsers
     * const { count } = await prisma.orgUser.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrgUserDeleteManyArgs>(args?: SelectSubset<T, OrgUserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrgUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgUserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OrgUsers
     * const orgUser = await prisma.orgUser.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrgUserUpdateManyArgs>(args: SelectSubset<T, OrgUserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrgUsers and returns the data updated in the database.
     * @param {OrgUserUpdateManyAndReturnArgs} args - Arguments to update many OrgUsers.
     * @example
     * // Update many OrgUsers
     * const orgUser = await prisma.orgUser.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OrgUsers and only return the `id`
     * const orgUserWithIdOnly = await prisma.orgUser.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OrgUserUpdateManyAndReturnArgs>(args: SelectSubset<T, OrgUserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrgUserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OrgUser.
     * @param {OrgUserUpsertArgs} args - Arguments to update or create a OrgUser.
     * @example
     * // Update or create a OrgUser
     * const orgUser = await prisma.orgUser.upsert({
     *   create: {
     *     // ... data to create a OrgUser
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OrgUser we want to update
     *   }
     * })
     */
    upsert<T extends OrgUserUpsertArgs>(args: SelectSubset<T, OrgUserUpsertArgs<ExtArgs>>): Prisma__OrgUserClient<$Result.GetResult<Prisma.$OrgUserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OrgUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgUserCountArgs} args - Arguments to filter OrgUsers to count.
     * @example
     * // Count the number of OrgUsers
     * const count = await prisma.orgUser.count({
     *   where: {
     *     // ... the filter for the OrgUsers we want to count
     *   }
     * })
    **/
    count<T extends OrgUserCountArgs>(
      args?: Subset<T, OrgUserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrgUserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OrgUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgUserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrgUserAggregateArgs>(args: Subset<T, OrgUserAggregateArgs>): Prisma.PrismaPromise<GetOrgUserAggregateType<T>>

    /**
     * Group by OrgUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgUserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OrgUserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrgUserGroupByArgs['orderBy'] }
        : { orderBy?: OrgUserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OrgUserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrgUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OrgUser model
   */
  readonly fields: OrgUserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OrgUser.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrgUserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    roles<T extends OrgUser$rolesArgs<ExtArgs> = {}>(args?: Subset<T, OrgUser$rolesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrgUserRolePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    auditLogs<T extends OrgUser$auditLogsArgs<ExtArgs> = {}>(args?: Subset<T, OrgUser$auditLogsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OrgUser model
   */
  interface OrgUserFieldRefs {
    readonly id: FieldRef<"OrgUser", 'String'>
    readonly tenantId: FieldRef<"OrgUser", 'String'>
    readonly email: FieldRef<"OrgUser", 'String'>
    readonly passwordHash: FieldRef<"OrgUser", 'String'>
    readonly displayName: FieldRef<"OrgUser", 'String'>
    readonly isActive: FieldRef<"OrgUser", 'Boolean'>
    readonly totpSecret: FieldRef<"OrgUser", 'String'>
    readonly isTotpEnabled: FieldRef<"OrgUser", 'Boolean'>
    readonly createdAt: FieldRef<"OrgUser", 'DateTime'>
    readonly updatedAt: FieldRef<"OrgUser", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OrgUser findUnique
   */
  export type OrgUserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgUser
     */
    select?: OrgUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgUser
     */
    omit?: OrgUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgUserInclude<ExtArgs> | null
    /**
     * Filter, which OrgUser to fetch.
     */
    where: OrgUserWhereUniqueInput
  }

  /**
   * OrgUser findUniqueOrThrow
   */
  export type OrgUserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgUser
     */
    select?: OrgUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgUser
     */
    omit?: OrgUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgUserInclude<ExtArgs> | null
    /**
     * Filter, which OrgUser to fetch.
     */
    where: OrgUserWhereUniqueInput
  }

  /**
   * OrgUser findFirst
   */
  export type OrgUserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgUser
     */
    select?: OrgUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgUser
     */
    omit?: OrgUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgUserInclude<ExtArgs> | null
    /**
     * Filter, which OrgUser to fetch.
     */
    where?: OrgUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrgUsers to fetch.
     */
    orderBy?: OrgUserOrderByWithRelationInput | OrgUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrgUsers.
     */
    cursor?: OrgUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrgUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrgUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrgUsers.
     */
    distinct?: OrgUserScalarFieldEnum | OrgUserScalarFieldEnum[]
  }

  /**
   * OrgUser findFirstOrThrow
   */
  export type OrgUserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgUser
     */
    select?: OrgUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgUser
     */
    omit?: OrgUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgUserInclude<ExtArgs> | null
    /**
     * Filter, which OrgUser to fetch.
     */
    where?: OrgUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrgUsers to fetch.
     */
    orderBy?: OrgUserOrderByWithRelationInput | OrgUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrgUsers.
     */
    cursor?: OrgUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrgUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrgUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrgUsers.
     */
    distinct?: OrgUserScalarFieldEnum | OrgUserScalarFieldEnum[]
  }

  /**
   * OrgUser findMany
   */
  export type OrgUserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgUser
     */
    select?: OrgUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgUser
     */
    omit?: OrgUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgUserInclude<ExtArgs> | null
    /**
     * Filter, which OrgUsers to fetch.
     */
    where?: OrgUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrgUsers to fetch.
     */
    orderBy?: OrgUserOrderByWithRelationInput | OrgUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OrgUsers.
     */
    cursor?: OrgUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrgUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrgUsers.
     */
    skip?: number
    distinct?: OrgUserScalarFieldEnum | OrgUserScalarFieldEnum[]
  }

  /**
   * OrgUser create
   */
  export type OrgUserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgUser
     */
    select?: OrgUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgUser
     */
    omit?: OrgUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgUserInclude<ExtArgs> | null
    /**
     * The data needed to create a OrgUser.
     */
    data: XOR<OrgUserCreateInput, OrgUserUncheckedCreateInput>
  }

  /**
   * OrgUser createMany
   */
  export type OrgUserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OrgUsers.
     */
    data: OrgUserCreateManyInput | OrgUserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OrgUser createManyAndReturn
   */
  export type OrgUserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgUser
     */
    select?: OrgUserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OrgUser
     */
    omit?: OrgUserOmit<ExtArgs> | null
    /**
     * The data used to create many OrgUsers.
     */
    data: OrgUserCreateManyInput | OrgUserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OrgUser update
   */
  export type OrgUserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgUser
     */
    select?: OrgUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgUser
     */
    omit?: OrgUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgUserInclude<ExtArgs> | null
    /**
     * The data needed to update a OrgUser.
     */
    data: XOR<OrgUserUpdateInput, OrgUserUncheckedUpdateInput>
    /**
     * Choose, which OrgUser to update.
     */
    where: OrgUserWhereUniqueInput
  }

  /**
   * OrgUser updateMany
   */
  export type OrgUserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OrgUsers.
     */
    data: XOR<OrgUserUpdateManyMutationInput, OrgUserUncheckedUpdateManyInput>
    /**
     * Filter which OrgUsers to update
     */
    where?: OrgUserWhereInput
    /**
     * Limit how many OrgUsers to update.
     */
    limit?: number
  }

  /**
   * OrgUser updateManyAndReturn
   */
  export type OrgUserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgUser
     */
    select?: OrgUserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OrgUser
     */
    omit?: OrgUserOmit<ExtArgs> | null
    /**
     * The data used to update OrgUsers.
     */
    data: XOR<OrgUserUpdateManyMutationInput, OrgUserUncheckedUpdateManyInput>
    /**
     * Filter which OrgUsers to update
     */
    where?: OrgUserWhereInput
    /**
     * Limit how many OrgUsers to update.
     */
    limit?: number
  }

  /**
   * OrgUser upsert
   */
  export type OrgUserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgUser
     */
    select?: OrgUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgUser
     */
    omit?: OrgUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgUserInclude<ExtArgs> | null
    /**
     * The filter to search for the OrgUser to update in case it exists.
     */
    where: OrgUserWhereUniqueInput
    /**
     * In case the OrgUser found by the `where` argument doesn't exist, create a new OrgUser with this data.
     */
    create: XOR<OrgUserCreateInput, OrgUserUncheckedCreateInput>
    /**
     * In case the OrgUser was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrgUserUpdateInput, OrgUserUncheckedUpdateInput>
  }

  /**
   * OrgUser delete
   */
  export type OrgUserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgUser
     */
    select?: OrgUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgUser
     */
    omit?: OrgUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgUserInclude<ExtArgs> | null
    /**
     * Filter which OrgUser to delete.
     */
    where: OrgUserWhereUniqueInput
  }

  /**
   * OrgUser deleteMany
   */
  export type OrgUserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrgUsers to delete
     */
    where?: OrgUserWhereInput
    /**
     * Limit how many OrgUsers to delete.
     */
    limit?: number
  }

  /**
   * OrgUser.roles
   */
  export type OrgUser$rolesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgUserRole
     */
    select?: OrgUserRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgUserRole
     */
    omit?: OrgUserRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgUserRoleInclude<ExtArgs> | null
    where?: OrgUserRoleWhereInput
    orderBy?: OrgUserRoleOrderByWithRelationInput | OrgUserRoleOrderByWithRelationInput[]
    cursor?: OrgUserRoleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrgUserRoleScalarFieldEnum | OrgUserRoleScalarFieldEnum[]
  }

  /**
   * OrgUser.auditLogs
   */
  export type OrgUser$auditLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    where?: AuditLogWhereInput
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    cursor?: AuditLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * OrgUser without action
   */
  export type OrgUserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgUser
     */
    select?: OrgUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgUser
     */
    omit?: OrgUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgUserInclude<ExtArgs> | null
  }


  /**
   * Model Role
   */

  export type AggregateRole = {
    _count: RoleCountAggregateOutputType | null
    _min: RoleMinAggregateOutputType | null
    _max: RoleMaxAggregateOutputType | null
  }

  export type RoleMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    name: string | null
    desc: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RoleMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    name: string | null
    desc: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RoleCountAggregateOutputType = {
    id: number
    tenantId: number
    name: number
    desc: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type RoleMinAggregateInputType = {
    id?: true
    tenantId?: true
    name?: true
    desc?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RoleMaxAggregateInputType = {
    id?: true
    tenantId?: true
    name?: true
    desc?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RoleCountAggregateInputType = {
    id?: true
    tenantId?: true
    name?: true
    desc?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type RoleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Role to aggregate.
     */
    where?: RoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Roles to fetch.
     */
    orderBy?: RoleOrderByWithRelationInput | RoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Roles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Roles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Roles
    **/
    _count?: true | RoleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RoleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RoleMaxAggregateInputType
  }

  export type GetRoleAggregateType<T extends RoleAggregateArgs> = {
        [P in keyof T & keyof AggregateRole]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRole[P]>
      : GetScalarType<T[P], AggregateRole[P]>
  }




  export type RoleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RoleWhereInput
    orderBy?: RoleOrderByWithAggregationInput | RoleOrderByWithAggregationInput[]
    by: RoleScalarFieldEnum[] | RoleScalarFieldEnum
    having?: RoleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RoleCountAggregateInputType | true
    _min?: RoleMinAggregateInputType
    _max?: RoleMaxAggregateInputType
  }

  export type RoleGroupByOutputType = {
    id: string
    tenantId: string
    name: string
    desc: string | null
    createdAt: Date
    updatedAt: Date
    _count: RoleCountAggregateOutputType | null
    _min: RoleMinAggregateOutputType | null
    _max: RoleMaxAggregateOutputType | null
  }

  type GetRoleGroupByPayload<T extends RoleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RoleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RoleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RoleGroupByOutputType[P]>
            : GetScalarType<T[P], RoleGroupByOutputType[P]>
        }
      >
    >


  export type RoleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    name?: boolean
    desc?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    permissions?: boolean | Role$permissionsArgs<ExtArgs>
    users?: boolean | Role$usersArgs<ExtArgs>
    _count?: boolean | RoleCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["role"]>

  export type RoleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    name?: boolean
    desc?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["role"]>

  export type RoleSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    name?: boolean
    desc?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["role"]>

  export type RoleSelectScalar = {
    id?: boolean
    tenantId?: boolean
    name?: boolean
    desc?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type RoleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "name" | "desc" | "createdAt" | "updatedAt", ExtArgs["result"]["role"]>
  export type RoleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    permissions?: boolean | Role$permissionsArgs<ExtArgs>
    users?: boolean | Role$usersArgs<ExtArgs>
    _count?: boolean | RoleCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type RoleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type RoleIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $RolePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Role"
    objects: {
      permissions: Prisma.$RolePermissionPayload<ExtArgs>[]
      users: Prisma.$OrgUserRolePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      name: string
      desc: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["role"]>
    composites: {}
  }

  type RoleGetPayload<S extends boolean | null | undefined | RoleDefaultArgs> = $Result.GetResult<Prisma.$RolePayload, S>

  type RoleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RoleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RoleCountAggregateInputType | true
    }

  export interface RoleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Role'], meta: { name: 'Role' } }
    /**
     * Find zero or one Role that matches the filter.
     * @param {RoleFindUniqueArgs} args - Arguments to find a Role
     * @example
     * // Get one Role
     * const role = await prisma.role.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RoleFindUniqueArgs>(args: SelectSubset<T, RoleFindUniqueArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Role that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RoleFindUniqueOrThrowArgs} args - Arguments to find a Role
     * @example
     * // Get one Role
     * const role = await prisma.role.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RoleFindUniqueOrThrowArgs>(args: SelectSubset<T, RoleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Role that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleFindFirstArgs} args - Arguments to find a Role
     * @example
     * // Get one Role
     * const role = await prisma.role.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RoleFindFirstArgs>(args?: SelectSubset<T, RoleFindFirstArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Role that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleFindFirstOrThrowArgs} args - Arguments to find a Role
     * @example
     * // Get one Role
     * const role = await prisma.role.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RoleFindFirstOrThrowArgs>(args?: SelectSubset<T, RoleFindFirstOrThrowArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Roles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Roles
     * const roles = await prisma.role.findMany()
     * 
     * // Get first 10 Roles
     * const roles = await prisma.role.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const roleWithIdOnly = await prisma.role.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RoleFindManyArgs>(args?: SelectSubset<T, RoleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Role.
     * @param {RoleCreateArgs} args - Arguments to create a Role.
     * @example
     * // Create one Role
     * const Role = await prisma.role.create({
     *   data: {
     *     // ... data to create a Role
     *   }
     * })
     * 
     */
    create<T extends RoleCreateArgs>(args: SelectSubset<T, RoleCreateArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Roles.
     * @param {RoleCreateManyArgs} args - Arguments to create many Roles.
     * @example
     * // Create many Roles
     * const role = await prisma.role.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RoleCreateManyArgs>(args?: SelectSubset<T, RoleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Roles and returns the data saved in the database.
     * @param {RoleCreateManyAndReturnArgs} args - Arguments to create many Roles.
     * @example
     * // Create many Roles
     * const role = await prisma.role.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Roles and only return the `id`
     * const roleWithIdOnly = await prisma.role.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RoleCreateManyAndReturnArgs>(args?: SelectSubset<T, RoleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Role.
     * @param {RoleDeleteArgs} args - Arguments to delete one Role.
     * @example
     * // Delete one Role
     * const Role = await prisma.role.delete({
     *   where: {
     *     // ... filter to delete one Role
     *   }
     * })
     * 
     */
    delete<T extends RoleDeleteArgs>(args: SelectSubset<T, RoleDeleteArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Role.
     * @param {RoleUpdateArgs} args - Arguments to update one Role.
     * @example
     * // Update one Role
     * const role = await prisma.role.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RoleUpdateArgs>(args: SelectSubset<T, RoleUpdateArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Roles.
     * @param {RoleDeleteManyArgs} args - Arguments to filter Roles to delete.
     * @example
     * // Delete a few Roles
     * const { count } = await prisma.role.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RoleDeleteManyArgs>(args?: SelectSubset<T, RoleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Roles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Roles
     * const role = await prisma.role.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RoleUpdateManyArgs>(args: SelectSubset<T, RoleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Roles and returns the data updated in the database.
     * @param {RoleUpdateManyAndReturnArgs} args - Arguments to update many Roles.
     * @example
     * // Update many Roles
     * const role = await prisma.role.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Roles and only return the `id`
     * const roleWithIdOnly = await prisma.role.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RoleUpdateManyAndReturnArgs>(args: SelectSubset<T, RoleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Role.
     * @param {RoleUpsertArgs} args - Arguments to update or create a Role.
     * @example
     * // Update or create a Role
     * const role = await prisma.role.upsert({
     *   create: {
     *     // ... data to create a Role
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Role we want to update
     *   }
     * })
     */
    upsert<T extends RoleUpsertArgs>(args: SelectSubset<T, RoleUpsertArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Roles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleCountArgs} args - Arguments to filter Roles to count.
     * @example
     * // Count the number of Roles
     * const count = await prisma.role.count({
     *   where: {
     *     // ... the filter for the Roles we want to count
     *   }
     * })
    **/
    count<T extends RoleCountArgs>(
      args?: Subset<T, RoleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RoleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Role.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RoleAggregateArgs>(args: Subset<T, RoleAggregateArgs>): Prisma.PrismaPromise<GetRoleAggregateType<T>>

    /**
     * Group by Role.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RoleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RoleGroupByArgs['orderBy'] }
        : { orderBy?: RoleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RoleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRoleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Role model
   */
  readonly fields: RoleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Role.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RoleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    permissions<T extends Role$permissionsArgs<ExtArgs> = {}>(args?: Subset<T, Role$permissionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    users<T extends Role$usersArgs<ExtArgs> = {}>(args?: Subset<T, Role$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrgUserRolePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Role model
   */
  interface RoleFieldRefs {
    readonly id: FieldRef<"Role", 'String'>
    readonly tenantId: FieldRef<"Role", 'String'>
    readonly name: FieldRef<"Role", 'String'>
    readonly desc: FieldRef<"Role", 'String'>
    readonly createdAt: FieldRef<"Role", 'DateTime'>
    readonly updatedAt: FieldRef<"Role", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Role findUnique
   */
  export type RoleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
    /**
     * Filter, which Role to fetch.
     */
    where: RoleWhereUniqueInput
  }

  /**
   * Role findUniqueOrThrow
   */
  export type RoleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
    /**
     * Filter, which Role to fetch.
     */
    where: RoleWhereUniqueInput
  }

  /**
   * Role findFirst
   */
  export type RoleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
    /**
     * Filter, which Role to fetch.
     */
    where?: RoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Roles to fetch.
     */
    orderBy?: RoleOrderByWithRelationInput | RoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Roles.
     */
    cursor?: RoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Roles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Roles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Roles.
     */
    distinct?: RoleScalarFieldEnum | RoleScalarFieldEnum[]
  }

  /**
   * Role findFirstOrThrow
   */
  export type RoleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
    /**
     * Filter, which Role to fetch.
     */
    where?: RoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Roles to fetch.
     */
    orderBy?: RoleOrderByWithRelationInput | RoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Roles.
     */
    cursor?: RoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Roles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Roles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Roles.
     */
    distinct?: RoleScalarFieldEnum | RoleScalarFieldEnum[]
  }

  /**
   * Role findMany
   */
  export type RoleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
    /**
     * Filter, which Roles to fetch.
     */
    where?: RoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Roles to fetch.
     */
    orderBy?: RoleOrderByWithRelationInput | RoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Roles.
     */
    cursor?: RoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Roles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Roles.
     */
    skip?: number
    distinct?: RoleScalarFieldEnum | RoleScalarFieldEnum[]
  }

  /**
   * Role create
   */
  export type RoleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
    /**
     * The data needed to create a Role.
     */
    data: XOR<RoleCreateInput, RoleUncheckedCreateInput>
  }

  /**
   * Role createMany
   */
  export type RoleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Roles.
     */
    data: RoleCreateManyInput | RoleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Role createManyAndReturn
   */
  export type RoleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * The data used to create many Roles.
     */
    data: RoleCreateManyInput | RoleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Role update
   */
  export type RoleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
    /**
     * The data needed to update a Role.
     */
    data: XOR<RoleUpdateInput, RoleUncheckedUpdateInput>
    /**
     * Choose, which Role to update.
     */
    where: RoleWhereUniqueInput
  }

  /**
   * Role updateMany
   */
  export type RoleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Roles.
     */
    data: XOR<RoleUpdateManyMutationInput, RoleUncheckedUpdateManyInput>
    /**
     * Filter which Roles to update
     */
    where?: RoleWhereInput
    /**
     * Limit how many Roles to update.
     */
    limit?: number
  }

  /**
   * Role updateManyAndReturn
   */
  export type RoleUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * The data used to update Roles.
     */
    data: XOR<RoleUpdateManyMutationInput, RoleUncheckedUpdateManyInput>
    /**
     * Filter which Roles to update
     */
    where?: RoleWhereInput
    /**
     * Limit how many Roles to update.
     */
    limit?: number
  }

  /**
   * Role upsert
   */
  export type RoleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
    /**
     * The filter to search for the Role to update in case it exists.
     */
    where: RoleWhereUniqueInput
    /**
     * In case the Role found by the `where` argument doesn't exist, create a new Role with this data.
     */
    create: XOR<RoleCreateInput, RoleUncheckedCreateInput>
    /**
     * In case the Role was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RoleUpdateInput, RoleUncheckedUpdateInput>
  }

  /**
   * Role delete
   */
  export type RoleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
    /**
     * Filter which Role to delete.
     */
    where: RoleWhereUniqueInput
  }

  /**
   * Role deleteMany
   */
  export type RoleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Roles to delete
     */
    where?: RoleWhereInput
    /**
     * Limit how many Roles to delete.
     */
    limit?: number
  }

  /**
   * Role.permissions
   */
  export type Role$permissionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RolePermission
     */
    omit?: RolePermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolePermissionInclude<ExtArgs> | null
    where?: RolePermissionWhereInput
    orderBy?: RolePermissionOrderByWithRelationInput | RolePermissionOrderByWithRelationInput[]
    cursor?: RolePermissionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RolePermissionScalarFieldEnum | RolePermissionScalarFieldEnum[]
  }

  /**
   * Role.users
   */
  export type Role$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgUserRole
     */
    select?: OrgUserRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgUserRole
     */
    omit?: OrgUserRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgUserRoleInclude<ExtArgs> | null
    where?: OrgUserRoleWhereInput
    orderBy?: OrgUserRoleOrderByWithRelationInput | OrgUserRoleOrderByWithRelationInput[]
    cursor?: OrgUserRoleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrgUserRoleScalarFieldEnum | OrgUserRoleScalarFieldEnum[]
  }

  /**
   * Role without action
   */
  export type RoleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Role
     */
    select?: RoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Role
     */
    omit?: RoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RoleInclude<ExtArgs> | null
  }


  /**
   * Model Permission
   */

  export type AggregatePermission = {
    _count: PermissionCountAggregateOutputType | null
    _min: PermissionMinAggregateOutputType | null
    _max: PermissionMaxAggregateOutputType | null
  }

  export type PermissionMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    key: string | null
    group: string | null
    desc: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PermissionMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    key: string | null
    group: string | null
    desc: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PermissionCountAggregateOutputType = {
    id: number
    tenantId: number
    key: number
    group: number
    desc: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PermissionMinAggregateInputType = {
    id?: true
    tenantId?: true
    key?: true
    group?: true
    desc?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PermissionMaxAggregateInputType = {
    id?: true
    tenantId?: true
    key?: true
    group?: true
    desc?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PermissionCountAggregateInputType = {
    id?: true
    tenantId?: true
    key?: true
    group?: true
    desc?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PermissionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Permission to aggregate.
     */
    where?: PermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Permissions to fetch.
     */
    orderBy?: PermissionOrderByWithRelationInput | PermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Permissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Permissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Permissions
    **/
    _count?: true | PermissionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PermissionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PermissionMaxAggregateInputType
  }

  export type GetPermissionAggregateType<T extends PermissionAggregateArgs> = {
        [P in keyof T & keyof AggregatePermission]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePermission[P]>
      : GetScalarType<T[P], AggregatePermission[P]>
  }




  export type PermissionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PermissionWhereInput
    orderBy?: PermissionOrderByWithAggregationInput | PermissionOrderByWithAggregationInput[]
    by: PermissionScalarFieldEnum[] | PermissionScalarFieldEnum
    having?: PermissionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PermissionCountAggregateInputType | true
    _min?: PermissionMinAggregateInputType
    _max?: PermissionMaxAggregateInputType
  }

  export type PermissionGroupByOutputType = {
    id: string
    tenantId: string
    key: string
    group: string | null
    desc: string | null
    createdAt: Date
    updatedAt: Date
    _count: PermissionCountAggregateOutputType | null
    _min: PermissionMinAggregateOutputType | null
    _max: PermissionMaxAggregateOutputType | null
  }

  type GetPermissionGroupByPayload<T extends PermissionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PermissionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PermissionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PermissionGroupByOutputType[P]>
            : GetScalarType<T[P], PermissionGroupByOutputType[P]>
        }
      >
    >


  export type PermissionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    key?: boolean
    group?: boolean
    desc?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    roles?: boolean | Permission$rolesArgs<ExtArgs>
    _count?: boolean | PermissionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["permission"]>

  export type PermissionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    key?: boolean
    group?: boolean
    desc?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["permission"]>

  export type PermissionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    key?: boolean
    group?: boolean
    desc?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["permission"]>

  export type PermissionSelectScalar = {
    id?: boolean
    tenantId?: boolean
    key?: boolean
    group?: boolean
    desc?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PermissionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "key" | "group" | "desc" | "createdAt" | "updatedAt", ExtArgs["result"]["permission"]>
  export type PermissionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    roles?: boolean | Permission$rolesArgs<ExtArgs>
    _count?: boolean | PermissionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PermissionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type PermissionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $PermissionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Permission"
    objects: {
      roles: Prisma.$RolePermissionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      key: string
      group: string | null
      desc: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["permission"]>
    composites: {}
  }

  type PermissionGetPayload<S extends boolean | null | undefined | PermissionDefaultArgs> = $Result.GetResult<Prisma.$PermissionPayload, S>

  type PermissionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PermissionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PermissionCountAggregateInputType | true
    }

  export interface PermissionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Permission'], meta: { name: 'Permission' } }
    /**
     * Find zero or one Permission that matches the filter.
     * @param {PermissionFindUniqueArgs} args - Arguments to find a Permission
     * @example
     * // Get one Permission
     * const permission = await prisma.permission.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PermissionFindUniqueArgs>(args: SelectSubset<T, PermissionFindUniqueArgs<ExtArgs>>): Prisma__PermissionClient<$Result.GetResult<Prisma.$PermissionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Permission that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PermissionFindUniqueOrThrowArgs} args - Arguments to find a Permission
     * @example
     * // Get one Permission
     * const permission = await prisma.permission.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PermissionFindUniqueOrThrowArgs>(args: SelectSubset<T, PermissionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PermissionClient<$Result.GetResult<Prisma.$PermissionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Permission that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PermissionFindFirstArgs} args - Arguments to find a Permission
     * @example
     * // Get one Permission
     * const permission = await prisma.permission.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PermissionFindFirstArgs>(args?: SelectSubset<T, PermissionFindFirstArgs<ExtArgs>>): Prisma__PermissionClient<$Result.GetResult<Prisma.$PermissionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Permission that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PermissionFindFirstOrThrowArgs} args - Arguments to find a Permission
     * @example
     * // Get one Permission
     * const permission = await prisma.permission.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PermissionFindFirstOrThrowArgs>(args?: SelectSubset<T, PermissionFindFirstOrThrowArgs<ExtArgs>>): Prisma__PermissionClient<$Result.GetResult<Prisma.$PermissionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Permissions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PermissionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Permissions
     * const permissions = await prisma.permission.findMany()
     * 
     * // Get first 10 Permissions
     * const permissions = await prisma.permission.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const permissionWithIdOnly = await prisma.permission.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PermissionFindManyArgs>(args?: SelectSubset<T, PermissionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PermissionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Permission.
     * @param {PermissionCreateArgs} args - Arguments to create a Permission.
     * @example
     * // Create one Permission
     * const Permission = await prisma.permission.create({
     *   data: {
     *     // ... data to create a Permission
     *   }
     * })
     * 
     */
    create<T extends PermissionCreateArgs>(args: SelectSubset<T, PermissionCreateArgs<ExtArgs>>): Prisma__PermissionClient<$Result.GetResult<Prisma.$PermissionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Permissions.
     * @param {PermissionCreateManyArgs} args - Arguments to create many Permissions.
     * @example
     * // Create many Permissions
     * const permission = await prisma.permission.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PermissionCreateManyArgs>(args?: SelectSubset<T, PermissionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Permissions and returns the data saved in the database.
     * @param {PermissionCreateManyAndReturnArgs} args - Arguments to create many Permissions.
     * @example
     * // Create many Permissions
     * const permission = await prisma.permission.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Permissions and only return the `id`
     * const permissionWithIdOnly = await prisma.permission.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PermissionCreateManyAndReturnArgs>(args?: SelectSubset<T, PermissionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PermissionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Permission.
     * @param {PermissionDeleteArgs} args - Arguments to delete one Permission.
     * @example
     * // Delete one Permission
     * const Permission = await prisma.permission.delete({
     *   where: {
     *     // ... filter to delete one Permission
     *   }
     * })
     * 
     */
    delete<T extends PermissionDeleteArgs>(args: SelectSubset<T, PermissionDeleteArgs<ExtArgs>>): Prisma__PermissionClient<$Result.GetResult<Prisma.$PermissionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Permission.
     * @param {PermissionUpdateArgs} args - Arguments to update one Permission.
     * @example
     * // Update one Permission
     * const permission = await prisma.permission.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PermissionUpdateArgs>(args: SelectSubset<T, PermissionUpdateArgs<ExtArgs>>): Prisma__PermissionClient<$Result.GetResult<Prisma.$PermissionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Permissions.
     * @param {PermissionDeleteManyArgs} args - Arguments to filter Permissions to delete.
     * @example
     * // Delete a few Permissions
     * const { count } = await prisma.permission.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PermissionDeleteManyArgs>(args?: SelectSubset<T, PermissionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Permissions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PermissionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Permissions
     * const permission = await prisma.permission.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PermissionUpdateManyArgs>(args: SelectSubset<T, PermissionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Permissions and returns the data updated in the database.
     * @param {PermissionUpdateManyAndReturnArgs} args - Arguments to update many Permissions.
     * @example
     * // Update many Permissions
     * const permission = await prisma.permission.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Permissions and only return the `id`
     * const permissionWithIdOnly = await prisma.permission.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PermissionUpdateManyAndReturnArgs>(args: SelectSubset<T, PermissionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PermissionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Permission.
     * @param {PermissionUpsertArgs} args - Arguments to update or create a Permission.
     * @example
     * // Update or create a Permission
     * const permission = await prisma.permission.upsert({
     *   create: {
     *     // ... data to create a Permission
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Permission we want to update
     *   }
     * })
     */
    upsert<T extends PermissionUpsertArgs>(args: SelectSubset<T, PermissionUpsertArgs<ExtArgs>>): Prisma__PermissionClient<$Result.GetResult<Prisma.$PermissionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Permissions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PermissionCountArgs} args - Arguments to filter Permissions to count.
     * @example
     * // Count the number of Permissions
     * const count = await prisma.permission.count({
     *   where: {
     *     // ... the filter for the Permissions we want to count
     *   }
     * })
    **/
    count<T extends PermissionCountArgs>(
      args?: Subset<T, PermissionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PermissionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Permission.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PermissionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PermissionAggregateArgs>(args: Subset<T, PermissionAggregateArgs>): Prisma.PrismaPromise<GetPermissionAggregateType<T>>

    /**
     * Group by Permission.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PermissionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PermissionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PermissionGroupByArgs['orderBy'] }
        : { orderBy?: PermissionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PermissionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPermissionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Permission model
   */
  readonly fields: PermissionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Permission.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PermissionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    roles<T extends Permission$rolesArgs<ExtArgs> = {}>(args?: Subset<T, Permission$rolesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Permission model
   */
  interface PermissionFieldRefs {
    readonly id: FieldRef<"Permission", 'String'>
    readonly tenantId: FieldRef<"Permission", 'String'>
    readonly key: FieldRef<"Permission", 'String'>
    readonly group: FieldRef<"Permission", 'String'>
    readonly desc: FieldRef<"Permission", 'String'>
    readonly createdAt: FieldRef<"Permission", 'DateTime'>
    readonly updatedAt: FieldRef<"Permission", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Permission findUnique
   */
  export type PermissionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Permission
     */
    select?: PermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Permission
     */
    omit?: PermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PermissionInclude<ExtArgs> | null
    /**
     * Filter, which Permission to fetch.
     */
    where: PermissionWhereUniqueInput
  }

  /**
   * Permission findUniqueOrThrow
   */
  export type PermissionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Permission
     */
    select?: PermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Permission
     */
    omit?: PermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PermissionInclude<ExtArgs> | null
    /**
     * Filter, which Permission to fetch.
     */
    where: PermissionWhereUniqueInput
  }

  /**
   * Permission findFirst
   */
  export type PermissionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Permission
     */
    select?: PermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Permission
     */
    omit?: PermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PermissionInclude<ExtArgs> | null
    /**
     * Filter, which Permission to fetch.
     */
    where?: PermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Permissions to fetch.
     */
    orderBy?: PermissionOrderByWithRelationInput | PermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Permissions.
     */
    cursor?: PermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Permissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Permissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Permissions.
     */
    distinct?: PermissionScalarFieldEnum | PermissionScalarFieldEnum[]
  }

  /**
   * Permission findFirstOrThrow
   */
  export type PermissionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Permission
     */
    select?: PermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Permission
     */
    omit?: PermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PermissionInclude<ExtArgs> | null
    /**
     * Filter, which Permission to fetch.
     */
    where?: PermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Permissions to fetch.
     */
    orderBy?: PermissionOrderByWithRelationInput | PermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Permissions.
     */
    cursor?: PermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Permissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Permissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Permissions.
     */
    distinct?: PermissionScalarFieldEnum | PermissionScalarFieldEnum[]
  }

  /**
   * Permission findMany
   */
  export type PermissionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Permission
     */
    select?: PermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Permission
     */
    omit?: PermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PermissionInclude<ExtArgs> | null
    /**
     * Filter, which Permissions to fetch.
     */
    where?: PermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Permissions to fetch.
     */
    orderBy?: PermissionOrderByWithRelationInput | PermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Permissions.
     */
    cursor?: PermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Permissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Permissions.
     */
    skip?: number
    distinct?: PermissionScalarFieldEnum | PermissionScalarFieldEnum[]
  }

  /**
   * Permission create
   */
  export type PermissionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Permission
     */
    select?: PermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Permission
     */
    omit?: PermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PermissionInclude<ExtArgs> | null
    /**
     * The data needed to create a Permission.
     */
    data: XOR<PermissionCreateInput, PermissionUncheckedCreateInput>
  }

  /**
   * Permission createMany
   */
  export type PermissionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Permissions.
     */
    data: PermissionCreateManyInput | PermissionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Permission createManyAndReturn
   */
  export type PermissionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Permission
     */
    select?: PermissionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Permission
     */
    omit?: PermissionOmit<ExtArgs> | null
    /**
     * The data used to create many Permissions.
     */
    data: PermissionCreateManyInput | PermissionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Permission update
   */
  export type PermissionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Permission
     */
    select?: PermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Permission
     */
    omit?: PermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PermissionInclude<ExtArgs> | null
    /**
     * The data needed to update a Permission.
     */
    data: XOR<PermissionUpdateInput, PermissionUncheckedUpdateInput>
    /**
     * Choose, which Permission to update.
     */
    where: PermissionWhereUniqueInput
  }

  /**
   * Permission updateMany
   */
  export type PermissionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Permissions.
     */
    data: XOR<PermissionUpdateManyMutationInput, PermissionUncheckedUpdateManyInput>
    /**
     * Filter which Permissions to update
     */
    where?: PermissionWhereInput
    /**
     * Limit how many Permissions to update.
     */
    limit?: number
  }

  /**
   * Permission updateManyAndReturn
   */
  export type PermissionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Permission
     */
    select?: PermissionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Permission
     */
    omit?: PermissionOmit<ExtArgs> | null
    /**
     * The data used to update Permissions.
     */
    data: XOR<PermissionUpdateManyMutationInput, PermissionUncheckedUpdateManyInput>
    /**
     * Filter which Permissions to update
     */
    where?: PermissionWhereInput
    /**
     * Limit how many Permissions to update.
     */
    limit?: number
  }

  /**
   * Permission upsert
   */
  export type PermissionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Permission
     */
    select?: PermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Permission
     */
    omit?: PermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PermissionInclude<ExtArgs> | null
    /**
     * The filter to search for the Permission to update in case it exists.
     */
    where: PermissionWhereUniqueInput
    /**
     * In case the Permission found by the `where` argument doesn't exist, create a new Permission with this data.
     */
    create: XOR<PermissionCreateInput, PermissionUncheckedCreateInput>
    /**
     * In case the Permission was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PermissionUpdateInput, PermissionUncheckedUpdateInput>
  }

  /**
   * Permission delete
   */
  export type PermissionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Permission
     */
    select?: PermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Permission
     */
    omit?: PermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PermissionInclude<ExtArgs> | null
    /**
     * Filter which Permission to delete.
     */
    where: PermissionWhereUniqueInput
  }

  /**
   * Permission deleteMany
   */
  export type PermissionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Permissions to delete
     */
    where?: PermissionWhereInput
    /**
     * Limit how many Permissions to delete.
     */
    limit?: number
  }

  /**
   * Permission.roles
   */
  export type Permission$rolesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RolePermission
     */
    omit?: RolePermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolePermissionInclude<ExtArgs> | null
    where?: RolePermissionWhereInput
    orderBy?: RolePermissionOrderByWithRelationInput | RolePermissionOrderByWithRelationInput[]
    cursor?: RolePermissionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RolePermissionScalarFieldEnum | RolePermissionScalarFieldEnum[]
  }

  /**
   * Permission without action
   */
  export type PermissionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Permission
     */
    select?: PermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Permission
     */
    omit?: PermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PermissionInclude<ExtArgs> | null
  }


  /**
   * Model RolePermission
   */

  export type AggregateRolePermission = {
    _count: RolePermissionCountAggregateOutputType | null
    _min: RolePermissionMinAggregateOutputType | null
    _max: RolePermissionMaxAggregateOutputType | null
  }

  export type RolePermissionMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    roleId: string | null
    permissionId: string | null
    createdAt: Date | null
  }

  export type RolePermissionMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    roleId: string | null
    permissionId: string | null
    createdAt: Date | null
  }

  export type RolePermissionCountAggregateOutputType = {
    id: number
    tenantId: number
    roleId: number
    permissionId: number
    createdAt: number
    _all: number
  }


  export type RolePermissionMinAggregateInputType = {
    id?: true
    tenantId?: true
    roleId?: true
    permissionId?: true
    createdAt?: true
  }

  export type RolePermissionMaxAggregateInputType = {
    id?: true
    tenantId?: true
    roleId?: true
    permissionId?: true
    createdAt?: true
  }

  export type RolePermissionCountAggregateInputType = {
    id?: true
    tenantId?: true
    roleId?: true
    permissionId?: true
    createdAt?: true
    _all?: true
  }

  export type RolePermissionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RolePermission to aggregate.
     */
    where?: RolePermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RolePermissions to fetch.
     */
    orderBy?: RolePermissionOrderByWithRelationInput | RolePermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RolePermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RolePermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RolePermissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RolePermissions
    **/
    _count?: true | RolePermissionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RolePermissionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RolePermissionMaxAggregateInputType
  }

  export type GetRolePermissionAggregateType<T extends RolePermissionAggregateArgs> = {
        [P in keyof T & keyof AggregateRolePermission]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRolePermission[P]>
      : GetScalarType<T[P], AggregateRolePermission[P]>
  }




  export type RolePermissionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RolePermissionWhereInput
    orderBy?: RolePermissionOrderByWithAggregationInput | RolePermissionOrderByWithAggregationInput[]
    by: RolePermissionScalarFieldEnum[] | RolePermissionScalarFieldEnum
    having?: RolePermissionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RolePermissionCountAggregateInputType | true
    _min?: RolePermissionMinAggregateInputType
    _max?: RolePermissionMaxAggregateInputType
  }

  export type RolePermissionGroupByOutputType = {
    id: string
    tenantId: string
    roleId: string
    permissionId: string
    createdAt: Date
    _count: RolePermissionCountAggregateOutputType | null
    _min: RolePermissionMinAggregateOutputType | null
    _max: RolePermissionMaxAggregateOutputType | null
  }

  type GetRolePermissionGroupByPayload<T extends RolePermissionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RolePermissionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RolePermissionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RolePermissionGroupByOutputType[P]>
            : GetScalarType<T[P], RolePermissionGroupByOutputType[P]>
        }
      >
    >


  export type RolePermissionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    roleId?: boolean
    permissionId?: boolean
    createdAt?: boolean
    role?: boolean | RoleDefaultArgs<ExtArgs>
    permission?: boolean | PermissionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["rolePermission"]>

  export type RolePermissionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    roleId?: boolean
    permissionId?: boolean
    createdAt?: boolean
    role?: boolean | RoleDefaultArgs<ExtArgs>
    permission?: boolean | PermissionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["rolePermission"]>

  export type RolePermissionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    roleId?: boolean
    permissionId?: boolean
    createdAt?: boolean
    role?: boolean | RoleDefaultArgs<ExtArgs>
    permission?: boolean | PermissionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["rolePermission"]>

  export type RolePermissionSelectScalar = {
    id?: boolean
    tenantId?: boolean
    roleId?: boolean
    permissionId?: boolean
    createdAt?: boolean
  }

  export type RolePermissionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "roleId" | "permissionId" | "createdAt", ExtArgs["result"]["rolePermission"]>
  export type RolePermissionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    role?: boolean | RoleDefaultArgs<ExtArgs>
    permission?: boolean | PermissionDefaultArgs<ExtArgs>
  }
  export type RolePermissionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    role?: boolean | RoleDefaultArgs<ExtArgs>
    permission?: boolean | PermissionDefaultArgs<ExtArgs>
  }
  export type RolePermissionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    role?: boolean | RoleDefaultArgs<ExtArgs>
    permission?: boolean | PermissionDefaultArgs<ExtArgs>
  }

  export type $RolePermissionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RolePermission"
    objects: {
      role: Prisma.$RolePayload<ExtArgs>
      permission: Prisma.$PermissionPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      roleId: string
      permissionId: string
      createdAt: Date
    }, ExtArgs["result"]["rolePermission"]>
    composites: {}
  }

  type RolePermissionGetPayload<S extends boolean | null | undefined | RolePermissionDefaultArgs> = $Result.GetResult<Prisma.$RolePermissionPayload, S>

  type RolePermissionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RolePermissionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RolePermissionCountAggregateInputType | true
    }

  export interface RolePermissionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RolePermission'], meta: { name: 'RolePermission' } }
    /**
     * Find zero or one RolePermission that matches the filter.
     * @param {RolePermissionFindUniqueArgs} args - Arguments to find a RolePermission
     * @example
     * // Get one RolePermission
     * const rolePermission = await prisma.rolePermission.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RolePermissionFindUniqueArgs>(args: SelectSubset<T, RolePermissionFindUniqueArgs<ExtArgs>>): Prisma__RolePermissionClient<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RolePermission that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RolePermissionFindUniqueOrThrowArgs} args - Arguments to find a RolePermission
     * @example
     * // Get one RolePermission
     * const rolePermission = await prisma.rolePermission.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RolePermissionFindUniqueOrThrowArgs>(args: SelectSubset<T, RolePermissionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RolePermissionClient<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RolePermission that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolePermissionFindFirstArgs} args - Arguments to find a RolePermission
     * @example
     * // Get one RolePermission
     * const rolePermission = await prisma.rolePermission.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RolePermissionFindFirstArgs>(args?: SelectSubset<T, RolePermissionFindFirstArgs<ExtArgs>>): Prisma__RolePermissionClient<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RolePermission that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolePermissionFindFirstOrThrowArgs} args - Arguments to find a RolePermission
     * @example
     * // Get one RolePermission
     * const rolePermission = await prisma.rolePermission.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RolePermissionFindFirstOrThrowArgs>(args?: SelectSubset<T, RolePermissionFindFirstOrThrowArgs<ExtArgs>>): Prisma__RolePermissionClient<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RolePermissions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolePermissionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RolePermissions
     * const rolePermissions = await prisma.rolePermission.findMany()
     * 
     * // Get first 10 RolePermissions
     * const rolePermissions = await prisma.rolePermission.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const rolePermissionWithIdOnly = await prisma.rolePermission.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RolePermissionFindManyArgs>(args?: SelectSubset<T, RolePermissionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RolePermission.
     * @param {RolePermissionCreateArgs} args - Arguments to create a RolePermission.
     * @example
     * // Create one RolePermission
     * const RolePermission = await prisma.rolePermission.create({
     *   data: {
     *     // ... data to create a RolePermission
     *   }
     * })
     * 
     */
    create<T extends RolePermissionCreateArgs>(args: SelectSubset<T, RolePermissionCreateArgs<ExtArgs>>): Prisma__RolePermissionClient<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RolePermissions.
     * @param {RolePermissionCreateManyArgs} args - Arguments to create many RolePermissions.
     * @example
     * // Create many RolePermissions
     * const rolePermission = await prisma.rolePermission.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RolePermissionCreateManyArgs>(args?: SelectSubset<T, RolePermissionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RolePermissions and returns the data saved in the database.
     * @param {RolePermissionCreateManyAndReturnArgs} args - Arguments to create many RolePermissions.
     * @example
     * // Create many RolePermissions
     * const rolePermission = await prisma.rolePermission.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RolePermissions and only return the `id`
     * const rolePermissionWithIdOnly = await prisma.rolePermission.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RolePermissionCreateManyAndReturnArgs>(args?: SelectSubset<T, RolePermissionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RolePermission.
     * @param {RolePermissionDeleteArgs} args - Arguments to delete one RolePermission.
     * @example
     * // Delete one RolePermission
     * const RolePermission = await prisma.rolePermission.delete({
     *   where: {
     *     // ... filter to delete one RolePermission
     *   }
     * })
     * 
     */
    delete<T extends RolePermissionDeleteArgs>(args: SelectSubset<T, RolePermissionDeleteArgs<ExtArgs>>): Prisma__RolePermissionClient<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RolePermission.
     * @param {RolePermissionUpdateArgs} args - Arguments to update one RolePermission.
     * @example
     * // Update one RolePermission
     * const rolePermission = await prisma.rolePermission.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RolePermissionUpdateArgs>(args: SelectSubset<T, RolePermissionUpdateArgs<ExtArgs>>): Prisma__RolePermissionClient<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RolePermissions.
     * @param {RolePermissionDeleteManyArgs} args - Arguments to filter RolePermissions to delete.
     * @example
     * // Delete a few RolePermissions
     * const { count } = await prisma.rolePermission.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RolePermissionDeleteManyArgs>(args?: SelectSubset<T, RolePermissionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RolePermissions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolePermissionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RolePermissions
     * const rolePermission = await prisma.rolePermission.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RolePermissionUpdateManyArgs>(args: SelectSubset<T, RolePermissionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RolePermissions and returns the data updated in the database.
     * @param {RolePermissionUpdateManyAndReturnArgs} args - Arguments to update many RolePermissions.
     * @example
     * // Update many RolePermissions
     * const rolePermission = await prisma.rolePermission.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RolePermissions and only return the `id`
     * const rolePermissionWithIdOnly = await prisma.rolePermission.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RolePermissionUpdateManyAndReturnArgs>(args: SelectSubset<T, RolePermissionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RolePermission.
     * @param {RolePermissionUpsertArgs} args - Arguments to update or create a RolePermission.
     * @example
     * // Update or create a RolePermission
     * const rolePermission = await prisma.rolePermission.upsert({
     *   create: {
     *     // ... data to create a RolePermission
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RolePermission we want to update
     *   }
     * })
     */
    upsert<T extends RolePermissionUpsertArgs>(args: SelectSubset<T, RolePermissionUpsertArgs<ExtArgs>>): Prisma__RolePermissionClient<$Result.GetResult<Prisma.$RolePermissionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RolePermissions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolePermissionCountArgs} args - Arguments to filter RolePermissions to count.
     * @example
     * // Count the number of RolePermissions
     * const count = await prisma.rolePermission.count({
     *   where: {
     *     // ... the filter for the RolePermissions we want to count
     *   }
     * })
    **/
    count<T extends RolePermissionCountArgs>(
      args?: Subset<T, RolePermissionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RolePermissionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RolePermission.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolePermissionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RolePermissionAggregateArgs>(args: Subset<T, RolePermissionAggregateArgs>): Prisma.PrismaPromise<GetRolePermissionAggregateType<T>>

    /**
     * Group by RolePermission.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RolePermissionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RolePermissionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RolePermissionGroupByArgs['orderBy'] }
        : { orderBy?: RolePermissionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RolePermissionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRolePermissionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RolePermission model
   */
  readonly fields: RolePermissionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RolePermission.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RolePermissionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    role<T extends RoleDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RoleDefaultArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    permission<T extends PermissionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PermissionDefaultArgs<ExtArgs>>): Prisma__PermissionClient<$Result.GetResult<Prisma.$PermissionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RolePermission model
   */
  interface RolePermissionFieldRefs {
    readonly id: FieldRef<"RolePermission", 'String'>
    readonly tenantId: FieldRef<"RolePermission", 'String'>
    readonly roleId: FieldRef<"RolePermission", 'String'>
    readonly permissionId: FieldRef<"RolePermission", 'String'>
    readonly createdAt: FieldRef<"RolePermission", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RolePermission findUnique
   */
  export type RolePermissionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RolePermission
     */
    omit?: RolePermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolePermissionInclude<ExtArgs> | null
    /**
     * Filter, which RolePermission to fetch.
     */
    where: RolePermissionWhereUniqueInput
  }

  /**
   * RolePermission findUniqueOrThrow
   */
  export type RolePermissionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RolePermission
     */
    omit?: RolePermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolePermissionInclude<ExtArgs> | null
    /**
     * Filter, which RolePermission to fetch.
     */
    where: RolePermissionWhereUniqueInput
  }

  /**
   * RolePermission findFirst
   */
  export type RolePermissionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RolePermission
     */
    omit?: RolePermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolePermissionInclude<ExtArgs> | null
    /**
     * Filter, which RolePermission to fetch.
     */
    where?: RolePermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RolePermissions to fetch.
     */
    orderBy?: RolePermissionOrderByWithRelationInput | RolePermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RolePermissions.
     */
    cursor?: RolePermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RolePermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RolePermissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RolePermissions.
     */
    distinct?: RolePermissionScalarFieldEnum | RolePermissionScalarFieldEnum[]
  }

  /**
   * RolePermission findFirstOrThrow
   */
  export type RolePermissionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RolePermission
     */
    omit?: RolePermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolePermissionInclude<ExtArgs> | null
    /**
     * Filter, which RolePermission to fetch.
     */
    where?: RolePermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RolePermissions to fetch.
     */
    orderBy?: RolePermissionOrderByWithRelationInput | RolePermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RolePermissions.
     */
    cursor?: RolePermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RolePermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RolePermissions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RolePermissions.
     */
    distinct?: RolePermissionScalarFieldEnum | RolePermissionScalarFieldEnum[]
  }

  /**
   * RolePermission findMany
   */
  export type RolePermissionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RolePermission
     */
    omit?: RolePermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolePermissionInclude<ExtArgs> | null
    /**
     * Filter, which RolePermissions to fetch.
     */
    where?: RolePermissionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RolePermissions to fetch.
     */
    orderBy?: RolePermissionOrderByWithRelationInput | RolePermissionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RolePermissions.
     */
    cursor?: RolePermissionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RolePermissions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RolePermissions.
     */
    skip?: number
    distinct?: RolePermissionScalarFieldEnum | RolePermissionScalarFieldEnum[]
  }

  /**
   * RolePermission create
   */
  export type RolePermissionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RolePermission
     */
    omit?: RolePermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolePermissionInclude<ExtArgs> | null
    /**
     * The data needed to create a RolePermission.
     */
    data: XOR<RolePermissionCreateInput, RolePermissionUncheckedCreateInput>
  }

  /**
   * RolePermission createMany
   */
  export type RolePermissionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RolePermissions.
     */
    data: RolePermissionCreateManyInput | RolePermissionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RolePermission createManyAndReturn
   */
  export type RolePermissionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RolePermission
     */
    omit?: RolePermissionOmit<ExtArgs> | null
    /**
     * The data used to create many RolePermissions.
     */
    data: RolePermissionCreateManyInput | RolePermissionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolePermissionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RolePermission update
   */
  export type RolePermissionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RolePermission
     */
    omit?: RolePermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolePermissionInclude<ExtArgs> | null
    /**
     * The data needed to update a RolePermission.
     */
    data: XOR<RolePermissionUpdateInput, RolePermissionUncheckedUpdateInput>
    /**
     * Choose, which RolePermission to update.
     */
    where: RolePermissionWhereUniqueInput
  }

  /**
   * RolePermission updateMany
   */
  export type RolePermissionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RolePermissions.
     */
    data: XOR<RolePermissionUpdateManyMutationInput, RolePermissionUncheckedUpdateManyInput>
    /**
     * Filter which RolePermissions to update
     */
    where?: RolePermissionWhereInput
    /**
     * Limit how many RolePermissions to update.
     */
    limit?: number
  }

  /**
   * RolePermission updateManyAndReturn
   */
  export type RolePermissionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RolePermission
     */
    omit?: RolePermissionOmit<ExtArgs> | null
    /**
     * The data used to update RolePermissions.
     */
    data: XOR<RolePermissionUpdateManyMutationInput, RolePermissionUncheckedUpdateManyInput>
    /**
     * Filter which RolePermissions to update
     */
    where?: RolePermissionWhereInput
    /**
     * Limit how many RolePermissions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolePermissionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * RolePermission upsert
   */
  export type RolePermissionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RolePermission
     */
    omit?: RolePermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolePermissionInclude<ExtArgs> | null
    /**
     * The filter to search for the RolePermission to update in case it exists.
     */
    where: RolePermissionWhereUniqueInput
    /**
     * In case the RolePermission found by the `where` argument doesn't exist, create a new RolePermission with this data.
     */
    create: XOR<RolePermissionCreateInput, RolePermissionUncheckedCreateInput>
    /**
     * In case the RolePermission was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RolePermissionUpdateInput, RolePermissionUncheckedUpdateInput>
  }

  /**
   * RolePermission delete
   */
  export type RolePermissionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RolePermission
     */
    omit?: RolePermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolePermissionInclude<ExtArgs> | null
    /**
     * Filter which RolePermission to delete.
     */
    where: RolePermissionWhereUniqueInput
  }

  /**
   * RolePermission deleteMany
   */
  export type RolePermissionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RolePermissions to delete
     */
    where?: RolePermissionWhereInput
    /**
     * Limit how many RolePermissions to delete.
     */
    limit?: number
  }

  /**
   * RolePermission without action
   */
  export type RolePermissionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RolePermission
     */
    select?: RolePermissionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RolePermission
     */
    omit?: RolePermissionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RolePermissionInclude<ExtArgs> | null
  }


  /**
   * Model OrgUserRole
   */

  export type AggregateOrgUserRole = {
    _count: OrgUserRoleCountAggregateOutputType | null
    _min: OrgUserRoleMinAggregateOutputType | null
    _max: OrgUserRoleMaxAggregateOutputType | null
  }

  export type OrgUserRoleMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    orgUserId: string | null
    roleId: string | null
    createdAt: Date | null
  }

  export type OrgUserRoleMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    orgUserId: string | null
    roleId: string | null
    createdAt: Date | null
  }

  export type OrgUserRoleCountAggregateOutputType = {
    id: number
    tenantId: number
    orgUserId: number
    roleId: number
    createdAt: number
    _all: number
  }


  export type OrgUserRoleMinAggregateInputType = {
    id?: true
    tenantId?: true
    orgUserId?: true
    roleId?: true
    createdAt?: true
  }

  export type OrgUserRoleMaxAggregateInputType = {
    id?: true
    tenantId?: true
    orgUserId?: true
    roleId?: true
    createdAt?: true
  }

  export type OrgUserRoleCountAggregateInputType = {
    id?: true
    tenantId?: true
    orgUserId?: true
    roleId?: true
    createdAt?: true
    _all?: true
  }

  export type OrgUserRoleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrgUserRole to aggregate.
     */
    where?: OrgUserRoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrgUserRoles to fetch.
     */
    orderBy?: OrgUserRoleOrderByWithRelationInput | OrgUserRoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrgUserRoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrgUserRoles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrgUserRoles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OrgUserRoles
    **/
    _count?: true | OrgUserRoleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrgUserRoleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrgUserRoleMaxAggregateInputType
  }

  export type GetOrgUserRoleAggregateType<T extends OrgUserRoleAggregateArgs> = {
        [P in keyof T & keyof AggregateOrgUserRole]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrgUserRole[P]>
      : GetScalarType<T[P], AggregateOrgUserRole[P]>
  }




  export type OrgUserRoleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrgUserRoleWhereInput
    orderBy?: OrgUserRoleOrderByWithAggregationInput | OrgUserRoleOrderByWithAggregationInput[]
    by: OrgUserRoleScalarFieldEnum[] | OrgUserRoleScalarFieldEnum
    having?: OrgUserRoleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrgUserRoleCountAggregateInputType | true
    _min?: OrgUserRoleMinAggregateInputType
    _max?: OrgUserRoleMaxAggregateInputType
  }

  export type OrgUserRoleGroupByOutputType = {
    id: string
    tenantId: string
    orgUserId: string
    roleId: string
    createdAt: Date
    _count: OrgUserRoleCountAggregateOutputType | null
    _min: OrgUserRoleMinAggregateOutputType | null
    _max: OrgUserRoleMaxAggregateOutputType | null
  }

  type GetOrgUserRoleGroupByPayload<T extends OrgUserRoleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrgUserRoleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrgUserRoleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrgUserRoleGroupByOutputType[P]>
            : GetScalarType<T[P], OrgUserRoleGroupByOutputType[P]>
        }
      >
    >


  export type OrgUserRoleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    orgUserId?: boolean
    roleId?: boolean
    createdAt?: boolean
    orgUser?: boolean | OrgUserDefaultArgs<ExtArgs>
    role?: boolean | RoleDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["orgUserRole"]>

  export type OrgUserRoleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    orgUserId?: boolean
    roleId?: boolean
    createdAt?: boolean
    orgUser?: boolean | OrgUserDefaultArgs<ExtArgs>
    role?: boolean | RoleDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["orgUserRole"]>

  export type OrgUserRoleSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    orgUserId?: boolean
    roleId?: boolean
    createdAt?: boolean
    orgUser?: boolean | OrgUserDefaultArgs<ExtArgs>
    role?: boolean | RoleDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["orgUserRole"]>

  export type OrgUserRoleSelectScalar = {
    id?: boolean
    tenantId?: boolean
    orgUserId?: boolean
    roleId?: boolean
    createdAt?: boolean
  }

  export type OrgUserRoleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "orgUserId" | "roleId" | "createdAt", ExtArgs["result"]["orgUserRole"]>
  export type OrgUserRoleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orgUser?: boolean | OrgUserDefaultArgs<ExtArgs>
    role?: boolean | RoleDefaultArgs<ExtArgs>
  }
  export type OrgUserRoleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orgUser?: boolean | OrgUserDefaultArgs<ExtArgs>
    role?: boolean | RoleDefaultArgs<ExtArgs>
  }
  export type OrgUserRoleIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orgUser?: boolean | OrgUserDefaultArgs<ExtArgs>
    role?: boolean | RoleDefaultArgs<ExtArgs>
  }

  export type $OrgUserRolePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OrgUserRole"
    objects: {
      orgUser: Prisma.$OrgUserPayload<ExtArgs>
      role: Prisma.$RolePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      orgUserId: string
      roleId: string
      createdAt: Date
    }, ExtArgs["result"]["orgUserRole"]>
    composites: {}
  }

  type OrgUserRoleGetPayload<S extends boolean | null | undefined | OrgUserRoleDefaultArgs> = $Result.GetResult<Prisma.$OrgUserRolePayload, S>

  type OrgUserRoleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrgUserRoleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrgUserRoleCountAggregateInputType | true
    }

  export interface OrgUserRoleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OrgUserRole'], meta: { name: 'OrgUserRole' } }
    /**
     * Find zero or one OrgUserRole that matches the filter.
     * @param {OrgUserRoleFindUniqueArgs} args - Arguments to find a OrgUserRole
     * @example
     * // Get one OrgUserRole
     * const orgUserRole = await prisma.orgUserRole.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrgUserRoleFindUniqueArgs>(args: SelectSubset<T, OrgUserRoleFindUniqueArgs<ExtArgs>>): Prisma__OrgUserRoleClient<$Result.GetResult<Prisma.$OrgUserRolePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OrgUserRole that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrgUserRoleFindUniqueOrThrowArgs} args - Arguments to find a OrgUserRole
     * @example
     * // Get one OrgUserRole
     * const orgUserRole = await prisma.orgUserRole.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrgUserRoleFindUniqueOrThrowArgs>(args: SelectSubset<T, OrgUserRoleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrgUserRoleClient<$Result.GetResult<Prisma.$OrgUserRolePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrgUserRole that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgUserRoleFindFirstArgs} args - Arguments to find a OrgUserRole
     * @example
     * // Get one OrgUserRole
     * const orgUserRole = await prisma.orgUserRole.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrgUserRoleFindFirstArgs>(args?: SelectSubset<T, OrgUserRoleFindFirstArgs<ExtArgs>>): Prisma__OrgUserRoleClient<$Result.GetResult<Prisma.$OrgUserRolePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrgUserRole that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgUserRoleFindFirstOrThrowArgs} args - Arguments to find a OrgUserRole
     * @example
     * // Get one OrgUserRole
     * const orgUserRole = await prisma.orgUserRole.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrgUserRoleFindFirstOrThrowArgs>(args?: SelectSubset<T, OrgUserRoleFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrgUserRoleClient<$Result.GetResult<Prisma.$OrgUserRolePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OrgUserRoles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgUserRoleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OrgUserRoles
     * const orgUserRoles = await prisma.orgUserRole.findMany()
     * 
     * // Get first 10 OrgUserRoles
     * const orgUserRoles = await prisma.orgUserRole.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const orgUserRoleWithIdOnly = await prisma.orgUserRole.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrgUserRoleFindManyArgs>(args?: SelectSubset<T, OrgUserRoleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrgUserRolePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OrgUserRole.
     * @param {OrgUserRoleCreateArgs} args - Arguments to create a OrgUserRole.
     * @example
     * // Create one OrgUserRole
     * const OrgUserRole = await prisma.orgUserRole.create({
     *   data: {
     *     // ... data to create a OrgUserRole
     *   }
     * })
     * 
     */
    create<T extends OrgUserRoleCreateArgs>(args: SelectSubset<T, OrgUserRoleCreateArgs<ExtArgs>>): Prisma__OrgUserRoleClient<$Result.GetResult<Prisma.$OrgUserRolePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OrgUserRoles.
     * @param {OrgUserRoleCreateManyArgs} args - Arguments to create many OrgUserRoles.
     * @example
     * // Create many OrgUserRoles
     * const orgUserRole = await prisma.orgUserRole.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrgUserRoleCreateManyArgs>(args?: SelectSubset<T, OrgUserRoleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OrgUserRoles and returns the data saved in the database.
     * @param {OrgUserRoleCreateManyAndReturnArgs} args - Arguments to create many OrgUserRoles.
     * @example
     * // Create many OrgUserRoles
     * const orgUserRole = await prisma.orgUserRole.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OrgUserRoles and only return the `id`
     * const orgUserRoleWithIdOnly = await prisma.orgUserRole.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrgUserRoleCreateManyAndReturnArgs>(args?: SelectSubset<T, OrgUserRoleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrgUserRolePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OrgUserRole.
     * @param {OrgUserRoleDeleteArgs} args - Arguments to delete one OrgUserRole.
     * @example
     * // Delete one OrgUserRole
     * const OrgUserRole = await prisma.orgUserRole.delete({
     *   where: {
     *     // ... filter to delete one OrgUserRole
     *   }
     * })
     * 
     */
    delete<T extends OrgUserRoleDeleteArgs>(args: SelectSubset<T, OrgUserRoleDeleteArgs<ExtArgs>>): Prisma__OrgUserRoleClient<$Result.GetResult<Prisma.$OrgUserRolePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OrgUserRole.
     * @param {OrgUserRoleUpdateArgs} args - Arguments to update one OrgUserRole.
     * @example
     * // Update one OrgUserRole
     * const orgUserRole = await prisma.orgUserRole.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrgUserRoleUpdateArgs>(args: SelectSubset<T, OrgUserRoleUpdateArgs<ExtArgs>>): Prisma__OrgUserRoleClient<$Result.GetResult<Prisma.$OrgUserRolePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OrgUserRoles.
     * @param {OrgUserRoleDeleteManyArgs} args - Arguments to filter OrgUserRoles to delete.
     * @example
     * // Delete a few OrgUserRoles
     * const { count } = await prisma.orgUserRole.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrgUserRoleDeleteManyArgs>(args?: SelectSubset<T, OrgUserRoleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrgUserRoles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgUserRoleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OrgUserRoles
     * const orgUserRole = await prisma.orgUserRole.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrgUserRoleUpdateManyArgs>(args: SelectSubset<T, OrgUserRoleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrgUserRoles and returns the data updated in the database.
     * @param {OrgUserRoleUpdateManyAndReturnArgs} args - Arguments to update many OrgUserRoles.
     * @example
     * // Update many OrgUserRoles
     * const orgUserRole = await prisma.orgUserRole.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OrgUserRoles and only return the `id`
     * const orgUserRoleWithIdOnly = await prisma.orgUserRole.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OrgUserRoleUpdateManyAndReturnArgs>(args: SelectSubset<T, OrgUserRoleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrgUserRolePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OrgUserRole.
     * @param {OrgUserRoleUpsertArgs} args - Arguments to update or create a OrgUserRole.
     * @example
     * // Update or create a OrgUserRole
     * const orgUserRole = await prisma.orgUserRole.upsert({
     *   create: {
     *     // ... data to create a OrgUserRole
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OrgUserRole we want to update
     *   }
     * })
     */
    upsert<T extends OrgUserRoleUpsertArgs>(args: SelectSubset<T, OrgUserRoleUpsertArgs<ExtArgs>>): Prisma__OrgUserRoleClient<$Result.GetResult<Prisma.$OrgUserRolePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OrgUserRoles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgUserRoleCountArgs} args - Arguments to filter OrgUserRoles to count.
     * @example
     * // Count the number of OrgUserRoles
     * const count = await prisma.orgUserRole.count({
     *   where: {
     *     // ... the filter for the OrgUserRoles we want to count
     *   }
     * })
    **/
    count<T extends OrgUserRoleCountArgs>(
      args?: Subset<T, OrgUserRoleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrgUserRoleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OrgUserRole.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgUserRoleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrgUserRoleAggregateArgs>(args: Subset<T, OrgUserRoleAggregateArgs>): Prisma.PrismaPromise<GetOrgUserRoleAggregateType<T>>

    /**
     * Group by OrgUserRole.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgUserRoleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OrgUserRoleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrgUserRoleGroupByArgs['orderBy'] }
        : { orderBy?: OrgUserRoleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OrgUserRoleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrgUserRoleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OrgUserRole model
   */
  readonly fields: OrgUserRoleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OrgUserRole.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrgUserRoleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    orgUser<T extends OrgUserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrgUserDefaultArgs<ExtArgs>>): Prisma__OrgUserClient<$Result.GetResult<Prisma.$OrgUserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    role<T extends RoleDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RoleDefaultArgs<ExtArgs>>): Prisma__RoleClient<$Result.GetResult<Prisma.$RolePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OrgUserRole model
   */
  interface OrgUserRoleFieldRefs {
    readonly id: FieldRef<"OrgUserRole", 'String'>
    readonly tenantId: FieldRef<"OrgUserRole", 'String'>
    readonly orgUserId: FieldRef<"OrgUserRole", 'String'>
    readonly roleId: FieldRef<"OrgUserRole", 'String'>
    readonly createdAt: FieldRef<"OrgUserRole", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OrgUserRole findUnique
   */
  export type OrgUserRoleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgUserRole
     */
    select?: OrgUserRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgUserRole
     */
    omit?: OrgUserRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgUserRoleInclude<ExtArgs> | null
    /**
     * Filter, which OrgUserRole to fetch.
     */
    where: OrgUserRoleWhereUniqueInput
  }

  /**
   * OrgUserRole findUniqueOrThrow
   */
  export type OrgUserRoleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgUserRole
     */
    select?: OrgUserRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgUserRole
     */
    omit?: OrgUserRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgUserRoleInclude<ExtArgs> | null
    /**
     * Filter, which OrgUserRole to fetch.
     */
    where: OrgUserRoleWhereUniqueInput
  }

  /**
   * OrgUserRole findFirst
   */
  export type OrgUserRoleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgUserRole
     */
    select?: OrgUserRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgUserRole
     */
    omit?: OrgUserRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgUserRoleInclude<ExtArgs> | null
    /**
     * Filter, which OrgUserRole to fetch.
     */
    where?: OrgUserRoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrgUserRoles to fetch.
     */
    orderBy?: OrgUserRoleOrderByWithRelationInput | OrgUserRoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrgUserRoles.
     */
    cursor?: OrgUserRoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrgUserRoles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrgUserRoles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrgUserRoles.
     */
    distinct?: OrgUserRoleScalarFieldEnum | OrgUserRoleScalarFieldEnum[]
  }

  /**
   * OrgUserRole findFirstOrThrow
   */
  export type OrgUserRoleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgUserRole
     */
    select?: OrgUserRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgUserRole
     */
    omit?: OrgUserRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgUserRoleInclude<ExtArgs> | null
    /**
     * Filter, which OrgUserRole to fetch.
     */
    where?: OrgUserRoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrgUserRoles to fetch.
     */
    orderBy?: OrgUserRoleOrderByWithRelationInput | OrgUserRoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrgUserRoles.
     */
    cursor?: OrgUserRoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrgUserRoles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrgUserRoles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrgUserRoles.
     */
    distinct?: OrgUserRoleScalarFieldEnum | OrgUserRoleScalarFieldEnum[]
  }

  /**
   * OrgUserRole findMany
   */
  export type OrgUserRoleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgUserRole
     */
    select?: OrgUserRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgUserRole
     */
    omit?: OrgUserRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgUserRoleInclude<ExtArgs> | null
    /**
     * Filter, which OrgUserRoles to fetch.
     */
    where?: OrgUserRoleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrgUserRoles to fetch.
     */
    orderBy?: OrgUserRoleOrderByWithRelationInput | OrgUserRoleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OrgUserRoles.
     */
    cursor?: OrgUserRoleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrgUserRoles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrgUserRoles.
     */
    skip?: number
    distinct?: OrgUserRoleScalarFieldEnum | OrgUserRoleScalarFieldEnum[]
  }

  /**
   * OrgUserRole create
   */
  export type OrgUserRoleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgUserRole
     */
    select?: OrgUserRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgUserRole
     */
    omit?: OrgUserRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgUserRoleInclude<ExtArgs> | null
    /**
     * The data needed to create a OrgUserRole.
     */
    data: XOR<OrgUserRoleCreateInput, OrgUserRoleUncheckedCreateInput>
  }

  /**
   * OrgUserRole createMany
   */
  export type OrgUserRoleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OrgUserRoles.
     */
    data: OrgUserRoleCreateManyInput | OrgUserRoleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OrgUserRole createManyAndReturn
   */
  export type OrgUserRoleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgUserRole
     */
    select?: OrgUserRoleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OrgUserRole
     */
    omit?: OrgUserRoleOmit<ExtArgs> | null
    /**
     * The data used to create many OrgUserRoles.
     */
    data: OrgUserRoleCreateManyInput | OrgUserRoleCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgUserRoleIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OrgUserRole update
   */
  export type OrgUserRoleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgUserRole
     */
    select?: OrgUserRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgUserRole
     */
    omit?: OrgUserRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgUserRoleInclude<ExtArgs> | null
    /**
     * The data needed to update a OrgUserRole.
     */
    data: XOR<OrgUserRoleUpdateInput, OrgUserRoleUncheckedUpdateInput>
    /**
     * Choose, which OrgUserRole to update.
     */
    where: OrgUserRoleWhereUniqueInput
  }

  /**
   * OrgUserRole updateMany
   */
  export type OrgUserRoleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OrgUserRoles.
     */
    data: XOR<OrgUserRoleUpdateManyMutationInput, OrgUserRoleUncheckedUpdateManyInput>
    /**
     * Filter which OrgUserRoles to update
     */
    where?: OrgUserRoleWhereInput
    /**
     * Limit how many OrgUserRoles to update.
     */
    limit?: number
  }

  /**
   * OrgUserRole updateManyAndReturn
   */
  export type OrgUserRoleUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgUserRole
     */
    select?: OrgUserRoleSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OrgUserRole
     */
    omit?: OrgUserRoleOmit<ExtArgs> | null
    /**
     * The data used to update OrgUserRoles.
     */
    data: XOR<OrgUserRoleUpdateManyMutationInput, OrgUserRoleUncheckedUpdateManyInput>
    /**
     * Filter which OrgUserRoles to update
     */
    where?: OrgUserRoleWhereInput
    /**
     * Limit how many OrgUserRoles to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgUserRoleIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * OrgUserRole upsert
   */
  export type OrgUserRoleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgUserRole
     */
    select?: OrgUserRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgUserRole
     */
    omit?: OrgUserRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgUserRoleInclude<ExtArgs> | null
    /**
     * The filter to search for the OrgUserRole to update in case it exists.
     */
    where: OrgUserRoleWhereUniqueInput
    /**
     * In case the OrgUserRole found by the `where` argument doesn't exist, create a new OrgUserRole with this data.
     */
    create: XOR<OrgUserRoleCreateInput, OrgUserRoleUncheckedCreateInput>
    /**
     * In case the OrgUserRole was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrgUserRoleUpdateInput, OrgUserRoleUncheckedUpdateInput>
  }

  /**
   * OrgUserRole delete
   */
  export type OrgUserRoleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgUserRole
     */
    select?: OrgUserRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgUserRole
     */
    omit?: OrgUserRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgUserRoleInclude<ExtArgs> | null
    /**
     * Filter which OrgUserRole to delete.
     */
    where: OrgUserRoleWhereUniqueInput
  }

  /**
   * OrgUserRole deleteMany
   */
  export type OrgUserRoleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrgUserRoles to delete
     */
    where?: OrgUserRoleWhereInput
    /**
     * Limit how many OrgUserRoles to delete.
     */
    limit?: number
  }

  /**
   * OrgUserRole without action
   */
  export type OrgUserRoleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgUserRole
     */
    select?: OrgUserRoleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgUserRole
     */
    omit?: OrgUserRoleOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgUserRoleInclude<ExtArgs> | null
  }


  /**
   * Model OrgInvite
   */

  export type AggregateOrgInvite = {
    _count: OrgInviteCountAggregateOutputType | null
    _min: OrgInviteMinAggregateOutputType | null
    _max: OrgInviteMaxAggregateOutputType | null
  }

  export type OrgInviteMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    email: string | null
    invitedById: string | null
    tokenHash: string | null
    expiresAt: Date | null
    acceptedAt: Date | null
    createdAt: Date | null
  }

  export type OrgInviteMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    email: string | null
    invitedById: string | null
    tokenHash: string | null
    expiresAt: Date | null
    acceptedAt: Date | null
    createdAt: Date | null
  }

  export type OrgInviteCountAggregateOutputType = {
    id: number
    tenantId: number
    email: number
    invitedById: number
    rolesJson: number
    tokenHash: number
    expiresAt: number
    acceptedAt: number
    createdAt: number
    _all: number
  }


  export type OrgInviteMinAggregateInputType = {
    id?: true
    tenantId?: true
    email?: true
    invitedById?: true
    tokenHash?: true
    expiresAt?: true
    acceptedAt?: true
    createdAt?: true
  }

  export type OrgInviteMaxAggregateInputType = {
    id?: true
    tenantId?: true
    email?: true
    invitedById?: true
    tokenHash?: true
    expiresAt?: true
    acceptedAt?: true
    createdAt?: true
  }

  export type OrgInviteCountAggregateInputType = {
    id?: true
    tenantId?: true
    email?: true
    invitedById?: true
    rolesJson?: true
    tokenHash?: true
    expiresAt?: true
    acceptedAt?: true
    createdAt?: true
    _all?: true
  }

  export type OrgInviteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrgInvite to aggregate.
     */
    where?: OrgInviteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrgInvites to fetch.
     */
    orderBy?: OrgInviteOrderByWithRelationInput | OrgInviteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrgInviteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrgInvites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrgInvites.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OrgInvites
    **/
    _count?: true | OrgInviteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrgInviteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrgInviteMaxAggregateInputType
  }

  export type GetOrgInviteAggregateType<T extends OrgInviteAggregateArgs> = {
        [P in keyof T & keyof AggregateOrgInvite]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrgInvite[P]>
      : GetScalarType<T[P], AggregateOrgInvite[P]>
  }




  export type OrgInviteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrgInviteWhereInput
    orderBy?: OrgInviteOrderByWithAggregationInput | OrgInviteOrderByWithAggregationInput[]
    by: OrgInviteScalarFieldEnum[] | OrgInviteScalarFieldEnum
    having?: OrgInviteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrgInviteCountAggregateInputType | true
    _min?: OrgInviteMinAggregateInputType
    _max?: OrgInviteMaxAggregateInputType
  }

  export type OrgInviteGroupByOutputType = {
    id: string
    tenantId: string
    email: string
    invitedById: string
    rolesJson: JsonValue
    tokenHash: string
    expiresAt: Date
    acceptedAt: Date | null
    createdAt: Date
    _count: OrgInviteCountAggregateOutputType | null
    _min: OrgInviteMinAggregateOutputType | null
    _max: OrgInviteMaxAggregateOutputType | null
  }

  type GetOrgInviteGroupByPayload<T extends OrgInviteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrgInviteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrgInviteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrgInviteGroupByOutputType[P]>
            : GetScalarType<T[P], OrgInviteGroupByOutputType[P]>
        }
      >
    >


  export type OrgInviteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    email?: boolean
    invitedById?: boolean
    rolesJson?: boolean
    tokenHash?: boolean
    expiresAt?: boolean
    acceptedAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["orgInvite"]>

  export type OrgInviteSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    email?: boolean
    invitedById?: boolean
    rolesJson?: boolean
    tokenHash?: boolean
    expiresAt?: boolean
    acceptedAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["orgInvite"]>

  export type OrgInviteSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    email?: boolean
    invitedById?: boolean
    rolesJson?: boolean
    tokenHash?: boolean
    expiresAt?: boolean
    acceptedAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["orgInvite"]>

  export type OrgInviteSelectScalar = {
    id?: boolean
    tenantId?: boolean
    email?: boolean
    invitedById?: boolean
    rolesJson?: boolean
    tokenHash?: boolean
    expiresAt?: boolean
    acceptedAt?: boolean
    createdAt?: boolean
  }

  export type OrgInviteOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "email" | "invitedById" | "rolesJson" | "tokenHash" | "expiresAt" | "acceptedAt" | "createdAt", ExtArgs["result"]["orgInvite"]>

  export type $OrgInvitePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OrgInvite"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      email: string
      invitedById: string
      rolesJson: Prisma.JsonValue
      tokenHash: string
      expiresAt: Date
      acceptedAt: Date | null
      createdAt: Date
    }, ExtArgs["result"]["orgInvite"]>
    composites: {}
  }

  type OrgInviteGetPayload<S extends boolean | null | undefined | OrgInviteDefaultArgs> = $Result.GetResult<Prisma.$OrgInvitePayload, S>

  type OrgInviteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrgInviteFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrgInviteCountAggregateInputType | true
    }

  export interface OrgInviteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OrgInvite'], meta: { name: 'OrgInvite' } }
    /**
     * Find zero or one OrgInvite that matches the filter.
     * @param {OrgInviteFindUniqueArgs} args - Arguments to find a OrgInvite
     * @example
     * // Get one OrgInvite
     * const orgInvite = await prisma.orgInvite.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrgInviteFindUniqueArgs>(args: SelectSubset<T, OrgInviteFindUniqueArgs<ExtArgs>>): Prisma__OrgInviteClient<$Result.GetResult<Prisma.$OrgInvitePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OrgInvite that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrgInviteFindUniqueOrThrowArgs} args - Arguments to find a OrgInvite
     * @example
     * // Get one OrgInvite
     * const orgInvite = await prisma.orgInvite.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrgInviteFindUniqueOrThrowArgs>(args: SelectSubset<T, OrgInviteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrgInviteClient<$Result.GetResult<Prisma.$OrgInvitePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrgInvite that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgInviteFindFirstArgs} args - Arguments to find a OrgInvite
     * @example
     * // Get one OrgInvite
     * const orgInvite = await prisma.orgInvite.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrgInviteFindFirstArgs>(args?: SelectSubset<T, OrgInviteFindFirstArgs<ExtArgs>>): Prisma__OrgInviteClient<$Result.GetResult<Prisma.$OrgInvitePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrgInvite that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgInviteFindFirstOrThrowArgs} args - Arguments to find a OrgInvite
     * @example
     * // Get one OrgInvite
     * const orgInvite = await prisma.orgInvite.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrgInviteFindFirstOrThrowArgs>(args?: SelectSubset<T, OrgInviteFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrgInviteClient<$Result.GetResult<Prisma.$OrgInvitePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OrgInvites that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgInviteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OrgInvites
     * const orgInvites = await prisma.orgInvite.findMany()
     * 
     * // Get first 10 OrgInvites
     * const orgInvites = await prisma.orgInvite.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const orgInviteWithIdOnly = await prisma.orgInvite.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrgInviteFindManyArgs>(args?: SelectSubset<T, OrgInviteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrgInvitePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OrgInvite.
     * @param {OrgInviteCreateArgs} args - Arguments to create a OrgInvite.
     * @example
     * // Create one OrgInvite
     * const OrgInvite = await prisma.orgInvite.create({
     *   data: {
     *     // ... data to create a OrgInvite
     *   }
     * })
     * 
     */
    create<T extends OrgInviteCreateArgs>(args: SelectSubset<T, OrgInviteCreateArgs<ExtArgs>>): Prisma__OrgInviteClient<$Result.GetResult<Prisma.$OrgInvitePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OrgInvites.
     * @param {OrgInviteCreateManyArgs} args - Arguments to create many OrgInvites.
     * @example
     * // Create many OrgInvites
     * const orgInvite = await prisma.orgInvite.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrgInviteCreateManyArgs>(args?: SelectSubset<T, OrgInviteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OrgInvites and returns the data saved in the database.
     * @param {OrgInviteCreateManyAndReturnArgs} args - Arguments to create many OrgInvites.
     * @example
     * // Create many OrgInvites
     * const orgInvite = await prisma.orgInvite.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OrgInvites and only return the `id`
     * const orgInviteWithIdOnly = await prisma.orgInvite.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrgInviteCreateManyAndReturnArgs>(args?: SelectSubset<T, OrgInviteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrgInvitePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OrgInvite.
     * @param {OrgInviteDeleteArgs} args - Arguments to delete one OrgInvite.
     * @example
     * // Delete one OrgInvite
     * const OrgInvite = await prisma.orgInvite.delete({
     *   where: {
     *     // ... filter to delete one OrgInvite
     *   }
     * })
     * 
     */
    delete<T extends OrgInviteDeleteArgs>(args: SelectSubset<T, OrgInviteDeleteArgs<ExtArgs>>): Prisma__OrgInviteClient<$Result.GetResult<Prisma.$OrgInvitePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OrgInvite.
     * @param {OrgInviteUpdateArgs} args - Arguments to update one OrgInvite.
     * @example
     * // Update one OrgInvite
     * const orgInvite = await prisma.orgInvite.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrgInviteUpdateArgs>(args: SelectSubset<T, OrgInviteUpdateArgs<ExtArgs>>): Prisma__OrgInviteClient<$Result.GetResult<Prisma.$OrgInvitePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OrgInvites.
     * @param {OrgInviteDeleteManyArgs} args - Arguments to filter OrgInvites to delete.
     * @example
     * // Delete a few OrgInvites
     * const { count } = await prisma.orgInvite.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrgInviteDeleteManyArgs>(args?: SelectSubset<T, OrgInviteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrgInvites.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgInviteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OrgInvites
     * const orgInvite = await prisma.orgInvite.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrgInviteUpdateManyArgs>(args: SelectSubset<T, OrgInviteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrgInvites and returns the data updated in the database.
     * @param {OrgInviteUpdateManyAndReturnArgs} args - Arguments to update many OrgInvites.
     * @example
     * // Update many OrgInvites
     * const orgInvite = await prisma.orgInvite.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OrgInvites and only return the `id`
     * const orgInviteWithIdOnly = await prisma.orgInvite.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OrgInviteUpdateManyAndReturnArgs>(args: SelectSubset<T, OrgInviteUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrgInvitePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OrgInvite.
     * @param {OrgInviteUpsertArgs} args - Arguments to update or create a OrgInvite.
     * @example
     * // Update or create a OrgInvite
     * const orgInvite = await prisma.orgInvite.upsert({
     *   create: {
     *     // ... data to create a OrgInvite
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OrgInvite we want to update
     *   }
     * })
     */
    upsert<T extends OrgInviteUpsertArgs>(args: SelectSubset<T, OrgInviteUpsertArgs<ExtArgs>>): Prisma__OrgInviteClient<$Result.GetResult<Prisma.$OrgInvitePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OrgInvites.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgInviteCountArgs} args - Arguments to filter OrgInvites to count.
     * @example
     * // Count the number of OrgInvites
     * const count = await prisma.orgInvite.count({
     *   where: {
     *     // ... the filter for the OrgInvites we want to count
     *   }
     * })
    **/
    count<T extends OrgInviteCountArgs>(
      args?: Subset<T, OrgInviteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrgInviteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OrgInvite.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgInviteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrgInviteAggregateArgs>(args: Subset<T, OrgInviteAggregateArgs>): Prisma.PrismaPromise<GetOrgInviteAggregateType<T>>

    /**
     * Group by OrgInvite.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrgInviteGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OrgInviteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrgInviteGroupByArgs['orderBy'] }
        : { orderBy?: OrgInviteGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OrgInviteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrgInviteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OrgInvite model
   */
  readonly fields: OrgInviteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OrgInvite.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrgInviteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OrgInvite model
   */
  interface OrgInviteFieldRefs {
    readonly id: FieldRef<"OrgInvite", 'String'>
    readonly tenantId: FieldRef<"OrgInvite", 'String'>
    readonly email: FieldRef<"OrgInvite", 'String'>
    readonly invitedById: FieldRef<"OrgInvite", 'String'>
    readonly rolesJson: FieldRef<"OrgInvite", 'Json'>
    readonly tokenHash: FieldRef<"OrgInvite", 'String'>
    readonly expiresAt: FieldRef<"OrgInvite", 'DateTime'>
    readonly acceptedAt: FieldRef<"OrgInvite", 'DateTime'>
    readonly createdAt: FieldRef<"OrgInvite", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OrgInvite findUnique
   */
  export type OrgInviteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgInvite
     */
    select?: OrgInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgInvite
     */
    omit?: OrgInviteOmit<ExtArgs> | null
    /**
     * Filter, which OrgInvite to fetch.
     */
    where: OrgInviteWhereUniqueInput
  }

  /**
   * OrgInvite findUniqueOrThrow
   */
  export type OrgInviteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgInvite
     */
    select?: OrgInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgInvite
     */
    omit?: OrgInviteOmit<ExtArgs> | null
    /**
     * Filter, which OrgInvite to fetch.
     */
    where: OrgInviteWhereUniqueInput
  }

  /**
   * OrgInvite findFirst
   */
  export type OrgInviteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgInvite
     */
    select?: OrgInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgInvite
     */
    omit?: OrgInviteOmit<ExtArgs> | null
    /**
     * Filter, which OrgInvite to fetch.
     */
    where?: OrgInviteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrgInvites to fetch.
     */
    orderBy?: OrgInviteOrderByWithRelationInput | OrgInviteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrgInvites.
     */
    cursor?: OrgInviteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrgInvites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrgInvites.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrgInvites.
     */
    distinct?: OrgInviteScalarFieldEnum | OrgInviteScalarFieldEnum[]
  }

  /**
   * OrgInvite findFirstOrThrow
   */
  export type OrgInviteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgInvite
     */
    select?: OrgInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgInvite
     */
    omit?: OrgInviteOmit<ExtArgs> | null
    /**
     * Filter, which OrgInvite to fetch.
     */
    where?: OrgInviteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrgInvites to fetch.
     */
    orderBy?: OrgInviteOrderByWithRelationInput | OrgInviteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrgInvites.
     */
    cursor?: OrgInviteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrgInvites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrgInvites.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrgInvites.
     */
    distinct?: OrgInviteScalarFieldEnum | OrgInviteScalarFieldEnum[]
  }

  /**
   * OrgInvite findMany
   */
  export type OrgInviteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgInvite
     */
    select?: OrgInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgInvite
     */
    omit?: OrgInviteOmit<ExtArgs> | null
    /**
     * Filter, which OrgInvites to fetch.
     */
    where?: OrgInviteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrgInvites to fetch.
     */
    orderBy?: OrgInviteOrderByWithRelationInput | OrgInviteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OrgInvites.
     */
    cursor?: OrgInviteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrgInvites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrgInvites.
     */
    skip?: number
    distinct?: OrgInviteScalarFieldEnum | OrgInviteScalarFieldEnum[]
  }

  /**
   * OrgInvite create
   */
  export type OrgInviteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgInvite
     */
    select?: OrgInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgInvite
     */
    omit?: OrgInviteOmit<ExtArgs> | null
    /**
     * The data needed to create a OrgInvite.
     */
    data: XOR<OrgInviteCreateInput, OrgInviteUncheckedCreateInput>
  }

  /**
   * OrgInvite createMany
   */
  export type OrgInviteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OrgInvites.
     */
    data: OrgInviteCreateManyInput | OrgInviteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OrgInvite createManyAndReturn
   */
  export type OrgInviteCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgInvite
     */
    select?: OrgInviteSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OrgInvite
     */
    omit?: OrgInviteOmit<ExtArgs> | null
    /**
     * The data used to create many OrgInvites.
     */
    data: OrgInviteCreateManyInput | OrgInviteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OrgInvite update
   */
  export type OrgInviteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgInvite
     */
    select?: OrgInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgInvite
     */
    omit?: OrgInviteOmit<ExtArgs> | null
    /**
     * The data needed to update a OrgInvite.
     */
    data: XOR<OrgInviteUpdateInput, OrgInviteUncheckedUpdateInput>
    /**
     * Choose, which OrgInvite to update.
     */
    where: OrgInviteWhereUniqueInput
  }

  /**
   * OrgInvite updateMany
   */
  export type OrgInviteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OrgInvites.
     */
    data: XOR<OrgInviteUpdateManyMutationInput, OrgInviteUncheckedUpdateManyInput>
    /**
     * Filter which OrgInvites to update
     */
    where?: OrgInviteWhereInput
    /**
     * Limit how many OrgInvites to update.
     */
    limit?: number
  }

  /**
   * OrgInvite updateManyAndReturn
   */
  export type OrgInviteUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgInvite
     */
    select?: OrgInviteSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OrgInvite
     */
    omit?: OrgInviteOmit<ExtArgs> | null
    /**
     * The data used to update OrgInvites.
     */
    data: XOR<OrgInviteUpdateManyMutationInput, OrgInviteUncheckedUpdateManyInput>
    /**
     * Filter which OrgInvites to update
     */
    where?: OrgInviteWhereInput
    /**
     * Limit how many OrgInvites to update.
     */
    limit?: number
  }

  /**
   * OrgInvite upsert
   */
  export type OrgInviteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgInvite
     */
    select?: OrgInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgInvite
     */
    omit?: OrgInviteOmit<ExtArgs> | null
    /**
     * The filter to search for the OrgInvite to update in case it exists.
     */
    where: OrgInviteWhereUniqueInput
    /**
     * In case the OrgInvite found by the `where` argument doesn't exist, create a new OrgInvite with this data.
     */
    create: XOR<OrgInviteCreateInput, OrgInviteUncheckedCreateInput>
    /**
     * In case the OrgInvite was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrgInviteUpdateInput, OrgInviteUncheckedUpdateInput>
  }

  /**
   * OrgInvite delete
   */
  export type OrgInviteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgInvite
     */
    select?: OrgInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgInvite
     */
    omit?: OrgInviteOmit<ExtArgs> | null
    /**
     * Filter which OrgInvite to delete.
     */
    where: OrgInviteWhereUniqueInput
  }

  /**
   * OrgInvite deleteMany
   */
  export type OrgInviteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrgInvites to delete
     */
    where?: OrgInviteWhereInput
    /**
     * Limit how many OrgInvites to delete.
     */
    limit?: number
  }

  /**
   * OrgInvite without action
   */
  export type OrgInviteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgInvite
     */
    select?: OrgInviteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgInvite
     */
    omit?: OrgInviteOmit<ExtArgs> | null
  }


  /**
   * Model AuditLog
   */

  export type AggregateAuditLog = {
    _count: AuditLogCountAggregateOutputType | null
    _min: AuditLogMinAggregateOutputType | null
    _max: AuditLogMaxAggregateOutputType | null
  }

  export type AuditLogMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    action: $Enums.AuditAction | null
    entityType: $Enums.AuditEntityType | null
    entityId: string | null
    userId: string | null
    orgUserId: string | null
    details: string | null
    ipAddress: string | null
    userAgent: string | null
    createdAt: Date | null
  }

  export type AuditLogMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    action: $Enums.AuditAction | null
    entityType: $Enums.AuditEntityType | null
    entityId: string | null
    userId: string | null
    orgUserId: string | null
    details: string | null
    ipAddress: string | null
    userAgent: string | null
    createdAt: Date | null
  }

  export type AuditLogCountAggregateOutputType = {
    id: number
    tenantId: number
    action: number
    entityType: number
    entityId: number
    userId: number
    orgUserId: number
    details: number
    ipAddress: number
    userAgent: number
    createdAt: number
    _all: number
  }


  export type AuditLogMinAggregateInputType = {
    id?: true
    tenantId?: true
    action?: true
    entityType?: true
    entityId?: true
    userId?: true
    orgUserId?: true
    details?: true
    ipAddress?: true
    userAgent?: true
    createdAt?: true
  }

  export type AuditLogMaxAggregateInputType = {
    id?: true
    tenantId?: true
    action?: true
    entityType?: true
    entityId?: true
    userId?: true
    orgUserId?: true
    details?: true
    ipAddress?: true
    userAgent?: true
    createdAt?: true
  }

  export type AuditLogCountAggregateInputType = {
    id?: true
    tenantId?: true
    action?: true
    entityType?: true
    entityId?: true
    userId?: true
    orgUserId?: true
    details?: true
    ipAddress?: true
    userAgent?: true
    createdAt?: true
    _all?: true
  }

  export type AuditLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLog to aggregate.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AuditLogs
    **/
    _count?: true | AuditLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuditLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuditLogMaxAggregateInputType
  }

  export type GetAuditLogAggregateType<T extends AuditLogAggregateArgs> = {
        [P in keyof T & keyof AggregateAuditLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuditLog[P]>
      : GetScalarType<T[P], AggregateAuditLog[P]>
  }




  export type AuditLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuditLogWhereInput
    orderBy?: AuditLogOrderByWithAggregationInput | AuditLogOrderByWithAggregationInput[]
    by: AuditLogScalarFieldEnum[] | AuditLogScalarFieldEnum
    having?: AuditLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AuditLogCountAggregateInputType | true
    _min?: AuditLogMinAggregateInputType
    _max?: AuditLogMaxAggregateInputType
  }

  export type AuditLogGroupByOutputType = {
    id: string
    tenantId: string
    action: $Enums.AuditAction
    entityType: $Enums.AuditEntityType
    entityId: string
    userId: string | null
    orgUserId: string | null
    details: string | null
    ipAddress: string | null
    userAgent: string | null
    createdAt: Date
    _count: AuditLogCountAggregateOutputType | null
    _min: AuditLogMinAggregateOutputType | null
    _max: AuditLogMaxAggregateOutputType | null
  }

  type GetAuditLogGroupByPayload<T extends AuditLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AuditLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AuditLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
            : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
        }
      >
    >


  export type AuditLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    action?: boolean
    entityType?: boolean
    entityId?: boolean
    userId?: boolean
    orgUserId?: boolean
    details?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    createdAt?: boolean
    user?: boolean | AuditLog$userArgs<ExtArgs>
    orgUser?: boolean | AuditLog$orgUserArgs<ExtArgs>
  }, ExtArgs["result"]["auditLog"]>

  export type AuditLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    action?: boolean
    entityType?: boolean
    entityId?: boolean
    userId?: boolean
    orgUserId?: boolean
    details?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    createdAt?: boolean
    user?: boolean | AuditLog$userArgs<ExtArgs>
    orgUser?: boolean | AuditLog$orgUserArgs<ExtArgs>
  }, ExtArgs["result"]["auditLog"]>

  export type AuditLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    action?: boolean
    entityType?: boolean
    entityId?: boolean
    userId?: boolean
    orgUserId?: boolean
    details?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    createdAt?: boolean
    user?: boolean | AuditLog$userArgs<ExtArgs>
    orgUser?: boolean | AuditLog$orgUserArgs<ExtArgs>
  }, ExtArgs["result"]["auditLog"]>

  export type AuditLogSelectScalar = {
    id?: boolean
    tenantId?: boolean
    action?: boolean
    entityType?: boolean
    entityId?: boolean
    userId?: boolean
    orgUserId?: boolean
    details?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    createdAt?: boolean
  }

  export type AuditLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "action" | "entityType" | "entityId" | "userId" | "orgUserId" | "details" | "ipAddress" | "userAgent" | "createdAt", ExtArgs["result"]["auditLog"]>
  export type AuditLogInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | AuditLog$userArgs<ExtArgs>
    orgUser?: boolean | AuditLog$orgUserArgs<ExtArgs>
  }
  export type AuditLogIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | AuditLog$userArgs<ExtArgs>
    orgUser?: boolean | AuditLog$orgUserArgs<ExtArgs>
  }
  export type AuditLogIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | AuditLog$userArgs<ExtArgs>
    orgUser?: boolean | AuditLog$orgUserArgs<ExtArgs>
  }

  export type $AuditLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AuditLog"
    objects: {
      user: Prisma.$GlobalUserPayload<ExtArgs> | null
      orgUser: Prisma.$OrgUserPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      action: $Enums.AuditAction
      entityType: $Enums.AuditEntityType
      entityId: string
      userId: string | null
      orgUserId: string | null
      details: string | null
      ipAddress: string | null
      userAgent: string | null
      createdAt: Date
    }, ExtArgs["result"]["auditLog"]>
    composites: {}
  }

  type AuditLogGetPayload<S extends boolean | null | undefined | AuditLogDefaultArgs> = $Result.GetResult<Prisma.$AuditLogPayload, S>

  type AuditLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AuditLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AuditLogCountAggregateInputType | true
    }

  export interface AuditLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AuditLog'], meta: { name: 'AuditLog' } }
    /**
     * Find zero or one AuditLog that matches the filter.
     * @param {AuditLogFindUniqueArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AuditLogFindUniqueArgs>(args: SelectSubset<T, AuditLogFindUniqueArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AuditLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AuditLogFindUniqueOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AuditLogFindUniqueOrThrowArgs>(args: SelectSubset<T, AuditLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuditLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AuditLogFindFirstArgs>(args?: SelectSubset<T, AuditLogFindFirstArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuditLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AuditLogFindFirstOrThrowArgs>(args?: SelectSubset<T, AuditLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AuditLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AuditLogs
     * const auditLogs = await prisma.auditLog.findMany()
     * 
     * // Get first 10 AuditLogs
     * const auditLogs = await prisma.auditLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AuditLogFindManyArgs>(args?: SelectSubset<T, AuditLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AuditLog.
     * @param {AuditLogCreateArgs} args - Arguments to create a AuditLog.
     * @example
     * // Create one AuditLog
     * const AuditLog = await prisma.auditLog.create({
     *   data: {
     *     // ... data to create a AuditLog
     *   }
     * })
     * 
     */
    create<T extends AuditLogCreateArgs>(args: SelectSubset<T, AuditLogCreateArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AuditLogs.
     * @param {AuditLogCreateManyArgs} args - Arguments to create many AuditLogs.
     * @example
     * // Create many AuditLogs
     * const auditLog = await prisma.auditLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AuditLogCreateManyArgs>(args?: SelectSubset<T, AuditLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AuditLogs and returns the data saved in the database.
     * @param {AuditLogCreateManyAndReturnArgs} args - Arguments to create many AuditLogs.
     * @example
     * // Create many AuditLogs
     * const auditLog = await prisma.auditLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AuditLogs and only return the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AuditLogCreateManyAndReturnArgs>(args?: SelectSubset<T, AuditLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AuditLog.
     * @param {AuditLogDeleteArgs} args - Arguments to delete one AuditLog.
     * @example
     * // Delete one AuditLog
     * const AuditLog = await prisma.auditLog.delete({
     *   where: {
     *     // ... filter to delete one AuditLog
     *   }
     * })
     * 
     */
    delete<T extends AuditLogDeleteArgs>(args: SelectSubset<T, AuditLogDeleteArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AuditLog.
     * @param {AuditLogUpdateArgs} args - Arguments to update one AuditLog.
     * @example
     * // Update one AuditLog
     * const auditLog = await prisma.auditLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AuditLogUpdateArgs>(args: SelectSubset<T, AuditLogUpdateArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AuditLogs.
     * @param {AuditLogDeleteManyArgs} args - Arguments to filter AuditLogs to delete.
     * @example
     * // Delete a few AuditLogs
     * const { count } = await prisma.auditLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AuditLogDeleteManyArgs>(args?: SelectSubset<T, AuditLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AuditLogs
     * const auditLog = await prisma.auditLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AuditLogUpdateManyArgs>(args: SelectSubset<T, AuditLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuditLogs and returns the data updated in the database.
     * @param {AuditLogUpdateManyAndReturnArgs} args - Arguments to update many AuditLogs.
     * @example
     * // Update many AuditLogs
     * const auditLog = await prisma.auditLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AuditLogs and only return the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AuditLogUpdateManyAndReturnArgs>(args: SelectSubset<T, AuditLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AuditLog.
     * @param {AuditLogUpsertArgs} args - Arguments to update or create a AuditLog.
     * @example
     * // Update or create a AuditLog
     * const auditLog = await prisma.auditLog.upsert({
     *   create: {
     *     // ... data to create a AuditLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AuditLog we want to update
     *   }
     * })
     */
    upsert<T extends AuditLogUpsertArgs>(args: SelectSubset<T, AuditLogUpsertArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogCountArgs} args - Arguments to filter AuditLogs to count.
     * @example
     * // Count the number of AuditLogs
     * const count = await prisma.auditLog.count({
     *   where: {
     *     // ... the filter for the AuditLogs we want to count
     *   }
     * })
    **/
    count<T extends AuditLogCountArgs>(
      args?: Subset<T, AuditLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuditLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AuditLogAggregateArgs>(args: Subset<T, AuditLogAggregateArgs>): Prisma.PrismaPromise<GetAuditLogAggregateType<T>>

    /**
     * Group by AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AuditLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AuditLogGroupByArgs['orderBy'] }
        : { orderBy?: AuditLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AuditLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuditLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AuditLog model
   */
  readonly fields: AuditLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AuditLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AuditLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends AuditLog$userArgs<ExtArgs> = {}>(args?: Subset<T, AuditLog$userArgs<ExtArgs>>): Prisma__GlobalUserClient<$Result.GetResult<Prisma.$GlobalUserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    orgUser<T extends AuditLog$orgUserArgs<ExtArgs> = {}>(args?: Subset<T, AuditLog$orgUserArgs<ExtArgs>>): Prisma__OrgUserClient<$Result.GetResult<Prisma.$OrgUserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AuditLog model
   */
  interface AuditLogFieldRefs {
    readonly id: FieldRef<"AuditLog", 'String'>
    readonly tenantId: FieldRef<"AuditLog", 'String'>
    readonly action: FieldRef<"AuditLog", 'AuditAction'>
    readonly entityType: FieldRef<"AuditLog", 'AuditEntityType'>
    readonly entityId: FieldRef<"AuditLog", 'String'>
    readonly userId: FieldRef<"AuditLog", 'String'>
    readonly orgUserId: FieldRef<"AuditLog", 'String'>
    readonly details: FieldRef<"AuditLog", 'String'>
    readonly ipAddress: FieldRef<"AuditLog", 'String'>
    readonly userAgent: FieldRef<"AuditLog", 'String'>
    readonly createdAt: FieldRef<"AuditLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AuditLog findUnique
   */
  export type AuditLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog findUniqueOrThrow
   */
  export type AuditLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog findFirst
   */
  export type AuditLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog findFirstOrThrow
   */
  export type AuditLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog findMany
   */
  export type AuditLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLogs to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog create
   */
  export type AuditLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * The data needed to create a AuditLog.
     */
    data: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>
  }

  /**
   * AuditLog createMany
   */
  export type AuditLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AuditLogs.
     */
    data: AuditLogCreateManyInput | AuditLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AuditLog createManyAndReturn
   */
  export type AuditLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * The data used to create many AuditLogs.
     */
    data: AuditLogCreateManyInput | AuditLogCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AuditLog update
   */
  export type AuditLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * The data needed to update a AuditLog.
     */
    data: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>
    /**
     * Choose, which AuditLog to update.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog updateMany
   */
  export type AuditLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AuditLogs.
     */
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyInput>
    /**
     * Filter which AuditLogs to update
     */
    where?: AuditLogWhereInput
    /**
     * Limit how many AuditLogs to update.
     */
    limit?: number
  }

  /**
   * AuditLog updateManyAndReturn
   */
  export type AuditLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * The data used to update AuditLogs.
     */
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyInput>
    /**
     * Filter which AuditLogs to update
     */
    where?: AuditLogWhereInput
    /**
     * Limit how many AuditLogs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AuditLog upsert
   */
  export type AuditLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * The filter to search for the AuditLog to update in case it exists.
     */
    where: AuditLogWhereUniqueInput
    /**
     * In case the AuditLog found by the `where` argument doesn't exist, create a new AuditLog with this data.
     */
    create: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>
    /**
     * In case the AuditLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>
  }

  /**
   * AuditLog delete
   */
  export type AuditLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter which AuditLog to delete.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog deleteMany
   */
  export type AuditLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLogs to delete
     */
    where?: AuditLogWhereInput
    /**
     * Limit how many AuditLogs to delete.
     */
    limit?: number
  }

  /**
   * AuditLog.user
   */
  export type AuditLog$userArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GlobalUser
     */
    select?: GlobalUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GlobalUser
     */
    omit?: GlobalUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GlobalUserInclude<ExtArgs> | null
    where?: GlobalUserWhereInput
  }

  /**
   * AuditLog.orgUser
   */
  export type AuditLog$orgUserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrgUser
     */
    select?: OrgUserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrgUser
     */
    omit?: OrgUserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrgUserInclude<ExtArgs> | null
    where?: OrgUserWhereInput
  }

  /**
   * AuditLog without action
   */
  export type AuditLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const GlobalUserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    passwordHash: 'passwordHash',
    totpSecret: 'totpSecret',
    isTotpEnabled: 'isTotpEnabled',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type GlobalUserScalarFieldEnum = (typeof GlobalUserScalarFieldEnum)[keyof typeof GlobalUserScalarFieldEnum]


  export const OrganisationScalarFieldEnum: {
    id: 'id',
    name: 'name',
    slug: 'slug',
    branding: 'branding',
    features: 'features',
    ownerId: 'ownerId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OrganisationScalarFieldEnum = (typeof OrganisationScalarFieldEnum)[keyof typeof OrganisationScalarFieldEnum]


  export const OrganisationAdminScalarFieldEnum: {
    id: 'id',
    organisationId: 'organisationId',
    globalUserId: 'globalUserId',
    role: 'role',
    createdAt: 'createdAt'
  };

  export type OrganisationAdminScalarFieldEnum = (typeof OrganisationAdminScalarFieldEnum)[keyof typeof OrganisationAdminScalarFieldEnum]


  export const NoteScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    title: 'title',
    body: 'body',
    createdBy: 'createdBy',
    createdAt: 'createdAt'
  };

  export type NoteScalarFieldEnum = (typeof NoteScalarFieldEnum)[keyof typeof NoteScalarFieldEnum]


  export const OrgUserScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    email: 'email',
    passwordHash: 'passwordHash',
    displayName: 'displayName',
    isActive: 'isActive',
    totpSecret: 'totpSecret',
    isTotpEnabled: 'isTotpEnabled',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OrgUserScalarFieldEnum = (typeof OrgUserScalarFieldEnum)[keyof typeof OrgUserScalarFieldEnum]


  export const RoleScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    name: 'name',
    desc: 'desc',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type RoleScalarFieldEnum = (typeof RoleScalarFieldEnum)[keyof typeof RoleScalarFieldEnum]


  export const PermissionScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    key: 'key',
    group: 'group',
    desc: 'desc',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PermissionScalarFieldEnum = (typeof PermissionScalarFieldEnum)[keyof typeof PermissionScalarFieldEnum]


  export const RolePermissionScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    roleId: 'roleId',
    permissionId: 'permissionId',
    createdAt: 'createdAt'
  };

  export type RolePermissionScalarFieldEnum = (typeof RolePermissionScalarFieldEnum)[keyof typeof RolePermissionScalarFieldEnum]


  export const OrgUserRoleScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    orgUserId: 'orgUserId',
    roleId: 'roleId',
    createdAt: 'createdAt'
  };

  export type OrgUserRoleScalarFieldEnum = (typeof OrgUserRoleScalarFieldEnum)[keyof typeof OrgUserRoleScalarFieldEnum]


  export const OrgInviteScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    email: 'email',
    invitedById: 'invitedById',
    rolesJson: 'rolesJson',
    tokenHash: 'tokenHash',
    expiresAt: 'expiresAt',
    acceptedAt: 'acceptedAt',
    createdAt: 'createdAt'
  };

  export type OrgInviteScalarFieldEnum = (typeof OrgInviteScalarFieldEnum)[keyof typeof OrgInviteScalarFieldEnum]


  export const AuditLogScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    action: 'action',
    entityType: 'entityType',
    entityId: 'entityId',
    userId: 'userId',
    orgUserId: 'orgUserId',
    details: 'details',
    ipAddress: 'ipAddress',
    userAgent: 'userAgent',
    createdAt: 'createdAt'
  };

  export type AuditLogScalarFieldEnum = (typeof AuditLogScalarFieldEnum)[keyof typeof AuditLogScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'AuditAction'
   */
  export type EnumAuditActionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AuditAction'>
    


  /**
   * Reference to a field of type 'AuditAction[]'
   */
  export type ListEnumAuditActionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AuditAction[]'>
    


  /**
   * Reference to a field of type 'AuditEntityType'
   */
  export type EnumAuditEntityTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AuditEntityType'>
    


  /**
   * Reference to a field of type 'AuditEntityType[]'
   */
  export type ListEnumAuditEntityTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AuditEntityType[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type GlobalUserWhereInput = {
    AND?: GlobalUserWhereInput | GlobalUserWhereInput[]
    OR?: GlobalUserWhereInput[]
    NOT?: GlobalUserWhereInput | GlobalUserWhereInput[]
    id?: StringFilter<"GlobalUser"> | string
    email?: StringFilter<"GlobalUser"> | string
    passwordHash?: StringFilter<"GlobalUser"> | string
    totpSecret?: StringNullableFilter<"GlobalUser"> | string | null
    isTotpEnabled?: BoolFilter<"GlobalUser"> | boolean
    createdAt?: DateTimeFilter<"GlobalUser"> | Date | string
    updatedAt?: DateTimeFilter<"GlobalUser"> | Date | string
    organisations?: OrganisationListRelationFilter
    organisationAdmins?: OrganisationAdminListRelationFilter
    auditLogs?: AuditLogListRelationFilter
  }

  export type GlobalUserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    totpSecret?: SortOrderInput | SortOrder
    isTotpEnabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    organisations?: OrganisationOrderByRelationAggregateInput
    organisationAdmins?: OrganisationAdminOrderByRelationAggregateInput
    auditLogs?: AuditLogOrderByRelationAggregateInput
  }

  export type GlobalUserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: GlobalUserWhereInput | GlobalUserWhereInput[]
    OR?: GlobalUserWhereInput[]
    NOT?: GlobalUserWhereInput | GlobalUserWhereInput[]
    passwordHash?: StringFilter<"GlobalUser"> | string
    totpSecret?: StringNullableFilter<"GlobalUser"> | string | null
    isTotpEnabled?: BoolFilter<"GlobalUser"> | boolean
    createdAt?: DateTimeFilter<"GlobalUser"> | Date | string
    updatedAt?: DateTimeFilter<"GlobalUser"> | Date | string
    organisations?: OrganisationListRelationFilter
    organisationAdmins?: OrganisationAdminListRelationFilter
    auditLogs?: AuditLogListRelationFilter
  }, "id" | "email">

  export type GlobalUserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    totpSecret?: SortOrderInput | SortOrder
    isTotpEnabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: GlobalUserCountOrderByAggregateInput
    _max?: GlobalUserMaxOrderByAggregateInput
    _min?: GlobalUserMinOrderByAggregateInput
  }

  export type GlobalUserScalarWhereWithAggregatesInput = {
    AND?: GlobalUserScalarWhereWithAggregatesInput | GlobalUserScalarWhereWithAggregatesInput[]
    OR?: GlobalUserScalarWhereWithAggregatesInput[]
    NOT?: GlobalUserScalarWhereWithAggregatesInput | GlobalUserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"GlobalUser"> | string
    email?: StringWithAggregatesFilter<"GlobalUser"> | string
    passwordHash?: StringWithAggregatesFilter<"GlobalUser"> | string
    totpSecret?: StringNullableWithAggregatesFilter<"GlobalUser"> | string | null
    isTotpEnabled?: BoolWithAggregatesFilter<"GlobalUser"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"GlobalUser"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"GlobalUser"> | Date | string
  }

  export type OrganisationWhereInput = {
    AND?: OrganisationWhereInput | OrganisationWhereInput[]
    OR?: OrganisationWhereInput[]
    NOT?: OrganisationWhereInput | OrganisationWhereInput[]
    id?: StringFilter<"Organisation"> | string
    name?: StringFilter<"Organisation"> | string
    slug?: StringFilter<"Organisation"> | string
    branding?: JsonNullableFilter<"Organisation">
    features?: JsonNullableFilter<"Organisation">
    ownerId?: StringFilter<"Organisation"> | string
    createdAt?: DateTimeFilter<"Organisation"> | Date | string
    updatedAt?: DateTimeFilter<"Organisation"> | Date | string
    owner?: XOR<GlobalUserScalarRelationFilter, GlobalUserWhereInput>
    admins?: OrganisationAdminListRelationFilter
  }

  export type OrganisationOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    branding?: SortOrderInput | SortOrder
    features?: SortOrderInput | SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    owner?: GlobalUserOrderByWithRelationInput
    admins?: OrganisationAdminOrderByRelationAggregateInput
  }

  export type OrganisationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    slug?: string
    AND?: OrganisationWhereInput | OrganisationWhereInput[]
    OR?: OrganisationWhereInput[]
    NOT?: OrganisationWhereInput | OrganisationWhereInput[]
    name?: StringFilter<"Organisation"> | string
    branding?: JsonNullableFilter<"Organisation">
    features?: JsonNullableFilter<"Organisation">
    ownerId?: StringFilter<"Organisation"> | string
    createdAt?: DateTimeFilter<"Organisation"> | Date | string
    updatedAt?: DateTimeFilter<"Organisation"> | Date | string
    owner?: XOR<GlobalUserScalarRelationFilter, GlobalUserWhereInput>
    admins?: OrganisationAdminListRelationFilter
  }, "id" | "slug">

  export type OrganisationOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    branding?: SortOrderInput | SortOrder
    features?: SortOrderInput | SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OrganisationCountOrderByAggregateInput
    _max?: OrganisationMaxOrderByAggregateInput
    _min?: OrganisationMinOrderByAggregateInput
  }

  export type OrganisationScalarWhereWithAggregatesInput = {
    AND?: OrganisationScalarWhereWithAggregatesInput | OrganisationScalarWhereWithAggregatesInput[]
    OR?: OrganisationScalarWhereWithAggregatesInput[]
    NOT?: OrganisationScalarWhereWithAggregatesInput | OrganisationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Organisation"> | string
    name?: StringWithAggregatesFilter<"Organisation"> | string
    slug?: StringWithAggregatesFilter<"Organisation"> | string
    branding?: JsonNullableWithAggregatesFilter<"Organisation">
    features?: JsonNullableWithAggregatesFilter<"Organisation">
    ownerId?: StringWithAggregatesFilter<"Organisation"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Organisation"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Organisation"> | Date | string
  }

  export type OrganisationAdminWhereInput = {
    AND?: OrganisationAdminWhereInput | OrganisationAdminWhereInput[]
    OR?: OrganisationAdminWhereInput[]
    NOT?: OrganisationAdminWhereInput | OrganisationAdminWhereInput[]
    id?: StringFilter<"OrganisationAdmin"> | string
    organisationId?: StringFilter<"OrganisationAdmin"> | string
    globalUserId?: StringFilter<"OrganisationAdmin"> | string
    role?: StringFilter<"OrganisationAdmin"> | string
    createdAt?: DateTimeFilter<"OrganisationAdmin"> | Date | string
    organisation?: XOR<OrganisationScalarRelationFilter, OrganisationWhereInput>
    globalUser?: XOR<GlobalUserScalarRelationFilter, GlobalUserWhereInput>
  }

  export type OrganisationAdminOrderByWithRelationInput = {
    id?: SortOrder
    organisationId?: SortOrder
    globalUserId?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    organisation?: OrganisationOrderByWithRelationInput
    globalUser?: GlobalUserOrderByWithRelationInput
  }

  export type OrganisationAdminWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    organisationId_globalUserId?: OrganisationAdminOrganisationIdGlobalUserIdCompoundUniqueInput
    AND?: OrganisationAdminWhereInput | OrganisationAdminWhereInput[]
    OR?: OrganisationAdminWhereInput[]
    NOT?: OrganisationAdminWhereInput | OrganisationAdminWhereInput[]
    organisationId?: StringFilter<"OrganisationAdmin"> | string
    globalUserId?: StringFilter<"OrganisationAdmin"> | string
    role?: StringFilter<"OrganisationAdmin"> | string
    createdAt?: DateTimeFilter<"OrganisationAdmin"> | Date | string
    organisation?: XOR<OrganisationScalarRelationFilter, OrganisationWhereInput>
    globalUser?: XOR<GlobalUserScalarRelationFilter, GlobalUserWhereInput>
  }, "id" | "organisationId_globalUserId">

  export type OrganisationAdminOrderByWithAggregationInput = {
    id?: SortOrder
    organisationId?: SortOrder
    globalUserId?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    _count?: OrganisationAdminCountOrderByAggregateInput
    _max?: OrganisationAdminMaxOrderByAggregateInput
    _min?: OrganisationAdminMinOrderByAggregateInput
  }

  export type OrganisationAdminScalarWhereWithAggregatesInput = {
    AND?: OrganisationAdminScalarWhereWithAggregatesInput | OrganisationAdminScalarWhereWithAggregatesInput[]
    OR?: OrganisationAdminScalarWhereWithAggregatesInput[]
    NOT?: OrganisationAdminScalarWhereWithAggregatesInput | OrganisationAdminScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OrganisationAdmin"> | string
    organisationId?: StringWithAggregatesFilter<"OrganisationAdmin"> | string
    globalUserId?: StringWithAggregatesFilter<"OrganisationAdmin"> | string
    role?: StringWithAggregatesFilter<"OrganisationAdmin"> | string
    createdAt?: DateTimeWithAggregatesFilter<"OrganisationAdmin"> | Date | string
  }

  export type NoteWhereInput = {
    AND?: NoteWhereInput | NoteWhereInput[]
    OR?: NoteWhereInput[]
    NOT?: NoteWhereInput | NoteWhereInput[]
    id?: StringFilter<"Note"> | string
    tenantId?: StringFilter<"Note"> | string
    title?: StringFilter<"Note"> | string
    body?: StringNullableFilter<"Note"> | string | null
    createdBy?: StringFilter<"Note"> | string
    createdAt?: DateTimeFilter<"Note"> | Date | string
  }

  export type NoteOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    title?: SortOrder
    body?: SortOrderInput | SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
  }

  export type NoteWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: NoteWhereInput | NoteWhereInput[]
    OR?: NoteWhereInput[]
    NOT?: NoteWhereInput | NoteWhereInput[]
    tenantId?: StringFilter<"Note"> | string
    title?: StringFilter<"Note"> | string
    body?: StringNullableFilter<"Note"> | string | null
    createdBy?: StringFilter<"Note"> | string
    createdAt?: DateTimeFilter<"Note"> | Date | string
  }, "id">

  export type NoteOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    title?: SortOrder
    body?: SortOrderInput | SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
    _count?: NoteCountOrderByAggregateInput
    _max?: NoteMaxOrderByAggregateInput
    _min?: NoteMinOrderByAggregateInput
  }

  export type NoteScalarWhereWithAggregatesInput = {
    AND?: NoteScalarWhereWithAggregatesInput | NoteScalarWhereWithAggregatesInput[]
    OR?: NoteScalarWhereWithAggregatesInput[]
    NOT?: NoteScalarWhereWithAggregatesInput | NoteScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Note"> | string
    tenantId?: StringWithAggregatesFilter<"Note"> | string
    title?: StringWithAggregatesFilter<"Note"> | string
    body?: StringNullableWithAggregatesFilter<"Note"> | string | null
    createdBy?: StringWithAggregatesFilter<"Note"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Note"> | Date | string
  }

  export type OrgUserWhereInput = {
    AND?: OrgUserWhereInput | OrgUserWhereInput[]
    OR?: OrgUserWhereInput[]
    NOT?: OrgUserWhereInput | OrgUserWhereInput[]
    id?: StringFilter<"OrgUser"> | string
    tenantId?: StringFilter<"OrgUser"> | string
    email?: StringFilter<"OrgUser"> | string
    passwordHash?: StringFilter<"OrgUser"> | string
    displayName?: StringFilter<"OrgUser"> | string
    isActive?: BoolFilter<"OrgUser"> | boolean
    totpSecret?: StringNullableFilter<"OrgUser"> | string | null
    isTotpEnabled?: BoolFilter<"OrgUser"> | boolean
    createdAt?: DateTimeFilter<"OrgUser"> | Date | string
    updatedAt?: DateTimeFilter<"OrgUser"> | Date | string
    roles?: OrgUserRoleListRelationFilter
    auditLogs?: AuditLogListRelationFilter
  }

  export type OrgUserOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    displayName?: SortOrder
    isActive?: SortOrder
    totpSecret?: SortOrderInput | SortOrder
    isTotpEnabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    roles?: OrgUserRoleOrderByRelationAggregateInput
    auditLogs?: AuditLogOrderByRelationAggregateInput
  }

  export type OrgUserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId_email?: OrgUserTenantIdEmailCompoundUniqueInput
    AND?: OrgUserWhereInput | OrgUserWhereInput[]
    OR?: OrgUserWhereInput[]
    NOT?: OrgUserWhereInput | OrgUserWhereInput[]
    tenantId?: StringFilter<"OrgUser"> | string
    email?: StringFilter<"OrgUser"> | string
    passwordHash?: StringFilter<"OrgUser"> | string
    displayName?: StringFilter<"OrgUser"> | string
    isActive?: BoolFilter<"OrgUser"> | boolean
    totpSecret?: StringNullableFilter<"OrgUser"> | string | null
    isTotpEnabled?: BoolFilter<"OrgUser"> | boolean
    createdAt?: DateTimeFilter<"OrgUser"> | Date | string
    updatedAt?: DateTimeFilter<"OrgUser"> | Date | string
    roles?: OrgUserRoleListRelationFilter
    auditLogs?: AuditLogListRelationFilter
  }, "id" | "tenantId_email">

  export type OrgUserOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    displayName?: SortOrder
    isActive?: SortOrder
    totpSecret?: SortOrderInput | SortOrder
    isTotpEnabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OrgUserCountOrderByAggregateInput
    _max?: OrgUserMaxOrderByAggregateInput
    _min?: OrgUserMinOrderByAggregateInput
  }

  export type OrgUserScalarWhereWithAggregatesInput = {
    AND?: OrgUserScalarWhereWithAggregatesInput | OrgUserScalarWhereWithAggregatesInput[]
    OR?: OrgUserScalarWhereWithAggregatesInput[]
    NOT?: OrgUserScalarWhereWithAggregatesInput | OrgUserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OrgUser"> | string
    tenantId?: StringWithAggregatesFilter<"OrgUser"> | string
    email?: StringWithAggregatesFilter<"OrgUser"> | string
    passwordHash?: StringWithAggregatesFilter<"OrgUser"> | string
    displayName?: StringWithAggregatesFilter<"OrgUser"> | string
    isActive?: BoolWithAggregatesFilter<"OrgUser"> | boolean
    totpSecret?: StringNullableWithAggregatesFilter<"OrgUser"> | string | null
    isTotpEnabled?: BoolWithAggregatesFilter<"OrgUser"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"OrgUser"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"OrgUser"> | Date | string
  }

  export type RoleWhereInput = {
    AND?: RoleWhereInput | RoleWhereInput[]
    OR?: RoleWhereInput[]
    NOT?: RoleWhereInput | RoleWhereInput[]
    id?: StringFilter<"Role"> | string
    tenantId?: StringFilter<"Role"> | string
    name?: StringFilter<"Role"> | string
    desc?: StringNullableFilter<"Role"> | string | null
    createdAt?: DateTimeFilter<"Role"> | Date | string
    updatedAt?: DateTimeFilter<"Role"> | Date | string
    permissions?: RolePermissionListRelationFilter
    users?: OrgUserRoleListRelationFilter
  }

  export type RoleOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    desc?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    permissions?: RolePermissionOrderByRelationAggregateInput
    users?: OrgUserRoleOrderByRelationAggregateInput
  }

  export type RoleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId_name?: RoleTenantIdNameCompoundUniqueInput
    AND?: RoleWhereInput | RoleWhereInput[]
    OR?: RoleWhereInput[]
    NOT?: RoleWhereInput | RoleWhereInput[]
    tenantId?: StringFilter<"Role"> | string
    name?: StringFilter<"Role"> | string
    desc?: StringNullableFilter<"Role"> | string | null
    createdAt?: DateTimeFilter<"Role"> | Date | string
    updatedAt?: DateTimeFilter<"Role"> | Date | string
    permissions?: RolePermissionListRelationFilter
    users?: OrgUserRoleListRelationFilter
  }, "id" | "tenantId_name">

  export type RoleOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    desc?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: RoleCountOrderByAggregateInput
    _max?: RoleMaxOrderByAggregateInput
    _min?: RoleMinOrderByAggregateInput
  }

  export type RoleScalarWhereWithAggregatesInput = {
    AND?: RoleScalarWhereWithAggregatesInput | RoleScalarWhereWithAggregatesInput[]
    OR?: RoleScalarWhereWithAggregatesInput[]
    NOT?: RoleScalarWhereWithAggregatesInput | RoleScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Role"> | string
    tenantId?: StringWithAggregatesFilter<"Role"> | string
    name?: StringWithAggregatesFilter<"Role"> | string
    desc?: StringNullableWithAggregatesFilter<"Role"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Role"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Role"> | Date | string
  }

  export type PermissionWhereInput = {
    AND?: PermissionWhereInput | PermissionWhereInput[]
    OR?: PermissionWhereInput[]
    NOT?: PermissionWhereInput | PermissionWhereInput[]
    id?: StringFilter<"Permission"> | string
    tenantId?: StringFilter<"Permission"> | string
    key?: StringFilter<"Permission"> | string
    group?: StringNullableFilter<"Permission"> | string | null
    desc?: StringNullableFilter<"Permission"> | string | null
    createdAt?: DateTimeFilter<"Permission"> | Date | string
    updatedAt?: DateTimeFilter<"Permission"> | Date | string
    roles?: RolePermissionListRelationFilter
  }

  export type PermissionOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    key?: SortOrder
    group?: SortOrderInput | SortOrder
    desc?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    roles?: RolePermissionOrderByRelationAggregateInput
  }

  export type PermissionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId_key?: PermissionTenantIdKeyCompoundUniqueInput
    AND?: PermissionWhereInput | PermissionWhereInput[]
    OR?: PermissionWhereInput[]
    NOT?: PermissionWhereInput | PermissionWhereInput[]
    tenantId?: StringFilter<"Permission"> | string
    key?: StringFilter<"Permission"> | string
    group?: StringNullableFilter<"Permission"> | string | null
    desc?: StringNullableFilter<"Permission"> | string | null
    createdAt?: DateTimeFilter<"Permission"> | Date | string
    updatedAt?: DateTimeFilter<"Permission"> | Date | string
    roles?: RolePermissionListRelationFilter
  }, "id" | "tenantId_key">

  export type PermissionOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    key?: SortOrder
    group?: SortOrderInput | SortOrder
    desc?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PermissionCountOrderByAggregateInput
    _max?: PermissionMaxOrderByAggregateInput
    _min?: PermissionMinOrderByAggregateInput
  }

  export type PermissionScalarWhereWithAggregatesInput = {
    AND?: PermissionScalarWhereWithAggregatesInput | PermissionScalarWhereWithAggregatesInput[]
    OR?: PermissionScalarWhereWithAggregatesInput[]
    NOT?: PermissionScalarWhereWithAggregatesInput | PermissionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Permission"> | string
    tenantId?: StringWithAggregatesFilter<"Permission"> | string
    key?: StringWithAggregatesFilter<"Permission"> | string
    group?: StringNullableWithAggregatesFilter<"Permission"> | string | null
    desc?: StringNullableWithAggregatesFilter<"Permission"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Permission"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Permission"> | Date | string
  }

  export type RolePermissionWhereInput = {
    AND?: RolePermissionWhereInput | RolePermissionWhereInput[]
    OR?: RolePermissionWhereInput[]
    NOT?: RolePermissionWhereInput | RolePermissionWhereInput[]
    id?: StringFilter<"RolePermission"> | string
    tenantId?: StringFilter<"RolePermission"> | string
    roleId?: StringFilter<"RolePermission"> | string
    permissionId?: StringFilter<"RolePermission"> | string
    createdAt?: DateTimeFilter<"RolePermission"> | Date | string
    role?: XOR<RoleScalarRelationFilter, RoleWhereInput>
    permission?: XOR<PermissionScalarRelationFilter, PermissionWhereInput>
  }

  export type RolePermissionOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    roleId?: SortOrder
    permissionId?: SortOrder
    createdAt?: SortOrder
    role?: RoleOrderByWithRelationInput
    permission?: PermissionOrderByWithRelationInput
  }

  export type RolePermissionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId_roleId_permissionId?: RolePermissionTenantIdRoleIdPermissionIdCompoundUniqueInput
    AND?: RolePermissionWhereInput | RolePermissionWhereInput[]
    OR?: RolePermissionWhereInput[]
    NOT?: RolePermissionWhereInput | RolePermissionWhereInput[]
    tenantId?: StringFilter<"RolePermission"> | string
    roleId?: StringFilter<"RolePermission"> | string
    permissionId?: StringFilter<"RolePermission"> | string
    createdAt?: DateTimeFilter<"RolePermission"> | Date | string
    role?: XOR<RoleScalarRelationFilter, RoleWhereInput>
    permission?: XOR<PermissionScalarRelationFilter, PermissionWhereInput>
  }, "id" | "tenantId_roleId_permissionId">

  export type RolePermissionOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    roleId?: SortOrder
    permissionId?: SortOrder
    createdAt?: SortOrder
    _count?: RolePermissionCountOrderByAggregateInput
    _max?: RolePermissionMaxOrderByAggregateInput
    _min?: RolePermissionMinOrderByAggregateInput
  }

  export type RolePermissionScalarWhereWithAggregatesInput = {
    AND?: RolePermissionScalarWhereWithAggregatesInput | RolePermissionScalarWhereWithAggregatesInput[]
    OR?: RolePermissionScalarWhereWithAggregatesInput[]
    NOT?: RolePermissionScalarWhereWithAggregatesInput | RolePermissionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"RolePermission"> | string
    tenantId?: StringWithAggregatesFilter<"RolePermission"> | string
    roleId?: StringWithAggregatesFilter<"RolePermission"> | string
    permissionId?: StringWithAggregatesFilter<"RolePermission"> | string
    createdAt?: DateTimeWithAggregatesFilter<"RolePermission"> | Date | string
  }

  export type OrgUserRoleWhereInput = {
    AND?: OrgUserRoleWhereInput | OrgUserRoleWhereInput[]
    OR?: OrgUserRoleWhereInput[]
    NOT?: OrgUserRoleWhereInput | OrgUserRoleWhereInput[]
    id?: StringFilter<"OrgUserRole"> | string
    tenantId?: StringFilter<"OrgUserRole"> | string
    orgUserId?: StringFilter<"OrgUserRole"> | string
    roleId?: StringFilter<"OrgUserRole"> | string
    createdAt?: DateTimeFilter<"OrgUserRole"> | Date | string
    orgUser?: XOR<OrgUserScalarRelationFilter, OrgUserWhereInput>
    role?: XOR<RoleScalarRelationFilter, RoleWhereInput>
  }

  export type OrgUserRoleOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    orgUserId?: SortOrder
    roleId?: SortOrder
    createdAt?: SortOrder
    orgUser?: OrgUserOrderByWithRelationInput
    role?: RoleOrderByWithRelationInput
  }

  export type OrgUserRoleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId_orgUserId_roleId?: OrgUserRoleTenantIdOrgUserIdRoleIdCompoundUniqueInput
    AND?: OrgUserRoleWhereInput | OrgUserRoleWhereInput[]
    OR?: OrgUserRoleWhereInput[]
    NOT?: OrgUserRoleWhereInput | OrgUserRoleWhereInput[]
    tenantId?: StringFilter<"OrgUserRole"> | string
    orgUserId?: StringFilter<"OrgUserRole"> | string
    roleId?: StringFilter<"OrgUserRole"> | string
    createdAt?: DateTimeFilter<"OrgUserRole"> | Date | string
    orgUser?: XOR<OrgUserScalarRelationFilter, OrgUserWhereInput>
    role?: XOR<RoleScalarRelationFilter, RoleWhereInput>
  }, "id" | "tenantId_orgUserId_roleId">

  export type OrgUserRoleOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    orgUserId?: SortOrder
    roleId?: SortOrder
    createdAt?: SortOrder
    _count?: OrgUserRoleCountOrderByAggregateInput
    _max?: OrgUserRoleMaxOrderByAggregateInput
    _min?: OrgUserRoleMinOrderByAggregateInput
  }

  export type OrgUserRoleScalarWhereWithAggregatesInput = {
    AND?: OrgUserRoleScalarWhereWithAggregatesInput | OrgUserRoleScalarWhereWithAggregatesInput[]
    OR?: OrgUserRoleScalarWhereWithAggregatesInput[]
    NOT?: OrgUserRoleScalarWhereWithAggregatesInput | OrgUserRoleScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OrgUserRole"> | string
    tenantId?: StringWithAggregatesFilter<"OrgUserRole"> | string
    orgUserId?: StringWithAggregatesFilter<"OrgUserRole"> | string
    roleId?: StringWithAggregatesFilter<"OrgUserRole"> | string
    createdAt?: DateTimeWithAggregatesFilter<"OrgUserRole"> | Date | string
  }

  export type OrgInviteWhereInput = {
    AND?: OrgInviteWhereInput | OrgInviteWhereInput[]
    OR?: OrgInviteWhereInput[]
    NOT?: OrgInviteWhereInput | OrgInviteWhereInput[]
    id?: StringFilter<"OrgInvite"> | string
    tenantId?: StringFilter<"OrgInvite"> | string
    email?: StringFilter<"OrgInvite"> | string
    invitedById?: StringFilter<"OrgInvite"> | string
    rolesJson?: JsonFilter<"OrgInvite">
    tokenHash?: StringFilter<"OrgInvite"> | string
    expiresAt?: DateTimeFilter<"OrgInvite"> | Date | string
    acceptedAt?: DateTimeNullableFilter<"OrgInvite"> | Date | string | null
    createdAt?: DateTimeFilter<"OrgInvite"> | Date | string
  }

  export type OrgInviteOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    invitedById?: SortOrder
    rolesJson?: SortOrder
    tokenHash?: SortOrder
    expiresAt?: SortOrder
    acceptedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type OrgInviteWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tenantId_email_acceptedAt?: OrgInviteTenantIdEmailAcceptedAtCompoundUniqueInput
    AND?: OrgInviteWhereInput | OrgInviteWhereInput[]
    OR?: OrgInviteWhereInput[]
    NOT?: OrgInviteWhereInput | OrgInviteWhereInput[]
    tenantId?: StringFilter<"OrgInvite"> | string
    email?: StringFilter<"OrgInvite"> | string
    invitedById?: StringFilter<"OrgInvite"> | string
    rolesJson?: JsonFilter<"OrgInvite">
    tokenHash?: StringFilter<"OrgInvite"> | string
    expiresAt?: DateTimeFilter<"OrgInvite"> | Date | string
    acceptedAt?: DateTimeNullableFilter<"OrgInvite"> | Date | string | null
    createdAt?: DateTimeFilter<"OrgInvite"> | Date | string
  }, "id" | "tenantId_email_acceptedAt">

  export type OrgInviteOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    invitedById?: SortOrder
    rolesJson?: SortOrder
    tokenHash?: SortOrder
    expiresAt?: SortOrder
    acceptedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: OrgInviteCountOrderByAggregateInput
    _max?: OrgInviteMaxOrderByAggregateInput
    _min?: OrgInviteMinOrderByAggregateInput
  }

  export type OrgInviteScalarWhereWithAggregatesInput = {
    AND?: OrgInviteScalarWhereWithAggregatesInput | OrgInviteScalarWhereWithAggregatesInput[]
    OR?: OrgInviteScalarWhereWithAggregatesInput[]
    NOT?: OrgInviteScalarWhereWithAggregatesInput | OrgInviteScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OrgInvite"> | string
    tenantId?: StringWithAggregatesFilter<"OrgInvite"> | string
    email?: StringWithAggregatesFilter<"OrgInvite"> | string
    invitedById?: StringWithAggregatesFilter<"OrgInvite"> | string
    rolesJson?: JsonWithAggregatesFilter<"OrgInvite">
    tokenHash?: StringWithAggregatesFilter<"OrgInvite"> | string
    expiresAt?: DateTimeWithAggregatesFilter<"OrgInvite"> | Date | string
    acceptedAt?: DateTimeNullableWithAggregatesFilter<"OrgInvite"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"OrgInvite"> | Date | string
  }

  export type AuditLogWhereInput = {
    AND?: AuditLogWhereInput | AuditLogWhereInput[]
    OR?: AuditLogWhereInput[]
    NOT?: AuditLogWhereInput | AuditLogWhereInput[]
    id?: StringFilter<"AuditLog"> | string
    tenantId?: StringFilter<"AuditLog"> | string
    action?: EnumAuditActionFilter<"AuditLog"> | $Enums.AuditAction
    entityType?: EnumAuditEntityTypeFilter<"AuditLog"> | $Enums.AuditEntityType
    entityId?: StringFilter<"AuditLog"> | string
    userId?: StringNullableFilter<"AuditLog"> | string | null
    orgUserId?: StringNullableFilter<"AuditLog"> | string | null
    details?: StringNullableFilter<"AuditLog"> | string | null
    ipAddress?: StringNullableFilter<"AuditLog"> | string | null
    userAgent?: StringNullableFilter<"AuditLog"> | string | null
    createdAt?: DateTimeFilter<"AuditLog"> | Date | string
    user?: XOR<GlobalUserNullableScalarRelationFilter, GlobalUserWhereInput> | null
    orgUser?: XOR<OrgUserNullableScalarRelationFilter, OrgUserWhereInput> | null
  }

  export type AuditLogOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    action?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    userId?: SortOrderInput | SortOrder
    orgUserId?: SortOrderInput | SortOrder
    details?: SortOrderInput | SortOrder
    ipAddress?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    user?: GlobalUserOrderByWithRelationInput
    orgUser?: OrgUserOrderByWithRelationInput
  }

  export type AuditLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AuditLogWhereInput | AuditLogWhereInput[]
    OR?: AuditLogWhereInput[]
    NOT?: AuditLogWhereInput | AuditLogWhereInput[]
    tenantId?: StringFilter<"AuditLog"> | string
    action?: EnumAuditActionFilter<"AuditLog"> | $Enums.AuditAction
    entityType?: EnumAuditEntityTypeFilter<"AuditLog"> | $Enums.AuditEntityType
    entityId?: StringFilter<"AuditLog"> | string
    userId?: StringNullableFilter<"AuditLog"> | string | null
    orgUserId?: StringNullableFilter<"AuditLog"> | string | null
    details?: StringNullableFilter<"AuditLog"> | string | null
    ipAddress?: StringNullableFilter<"AuditLog"> | string | null
    userAgent?: StringNullableFilter<"AuditLog"> | string | null
    createdAt?: DateTimeFilter<"AuditLog"> | Date | string
    user?: XOR<GlobalUserNullableScalarRelationFilter, GlobalUserWhereInput> | null
    orgUser?: XOR<OrgUserNullableScalarRelationFilter, OrgUserWhereInput> | null
  }, "id">

  export type AuditLogOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    action?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    userId?: SortOrderInput | SortOrder
    orgUserId?: SortOrderInput | SortOrder
    details?: SortOrderInput | SortOrder
    ipAddress?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: AuditLogCountOrderByAggregateInput
    _max?: AuditLogMaxOrderByAggregateInput
    _min?: AuditLogMinOrderByAggregateInput
  }

  export type AuditLogScalarWhereWithAggregatesInput = {
    AND?: AuditLogScalarWhereWithAggregatesInput | AuditLogScalarWhereWithAggregatesInput[]
    OR?: AuditLogScalarWhereWithAggregatesInput[]
    NOT?: AuditLogScalarWhereWithAggregatesInput | AuditLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AuditLog"> | string
    tenantId?: StringWithAggregatesFilter<"AuditLog"> | string
    action?: EnumAuditActionWithAggregatesFilter<"AuditLog"> | $Enums.AuditAction
    entityType?: EnumAuditEntityTypeWithAggregatesFilter<"AuditLog"> | $Enums.AuditEntityType
    entityId?: StringWithAggregatesFilter<"AuditLog"> | string
    userId?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    orgUserId?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    details?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    ipAddress?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    userAgent?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"AuditLog"> | Date | string
  }

  export type GlobalUserCreateInput = {
    id?: string
    email: string
    passwordHash: string
    totpSecret?: string | null
    isTotpEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    organisations?: OrganisationCreateNestedManyWithoutOwnerInput
    organisationAdmins?: OrganisationAdminCreateNestedManyWithoutGlobalUserInput
    auditLogs?: AuditLogCreateNestedManyWithoutUserInput
  }

  export type GlobalUserUncheckedCreateInput = {
    id?: string
    email: string
    passwordHash: string
    totpSecret?: string | null
    isTotpEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    organisations?: OrganisationUncheckedCreateNestedManyWithoutOwnerInput
    organisationAdmins?: OrganisationAdminUncheckedCreateNestedManyWithoutGlobalUserInput
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type GlobalUserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    totpSecret?: NullableStringFieldUpdateOperationsInput | string | null
    isTotpEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organisations?: OrganisationUpdateManyWithoutOwnerNestedInput
    organisationAdmins?: OrganisationAdminUpdateManyWithoutGlobalUserNestedInput
    auditLogs?: AuditLogUpdateManyWithoutUserNestedInput
  }

  export type GlobalUserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    totpSecret?: NullableStringFieldUpdateOperationsInput | string | null
    isTotpEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organisations?: OrganisationUncheckedUpdateManyWithoutOwnerNestedInput
    organisationAdmins?: OrganisationAdminUncheckedUpdateManyWithoutGlobalUserNestedInput
    auditLogs?: AuditLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type GlobalUserCreateManyInput = {
    id?: string
    email: string
    passwordHash: string
    totpSecret?: string | null
    isTotpEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GlobalUserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    totpSecret?: NullableStringFieldUpdateOperationsInput | string | null
    isTotpEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GlobalUserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    totpSecret?: NullableStringFieldUpdateOperationsInput | string | null
    isTotpEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganisationCreateInput = {
    id?: string
    name: string
    slug: string
    branding?: NullableJsonNullValueInput | InputJsonValue
    features?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    owner: GlobalUserCreateNestedOneWithoutOrganisationsInput
    admins?: OrganisationAdminCreateNestedManyWithoutOrganisationInput
  }

  export type OrganisationUncheckedCreateInput = {
    id?: string
    name: string
    slug: string
    branding?: NullableJsonNullValueInput | InputJsonValue
    features?: NullableJsonNullValueInput | InputJsonValue
    ownerId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    admins?: OrganisationAdminUncheckedCreateNestedManyWithoutOrganisationInput
  }

  export type OrganisationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    branding?: NullableJsonNullValueInput | InputJsonValue
    features?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    owner?: GlobalUserUpdateOneRequiredWithoutOrganisationsNestedInput
    admins?: OrganisationAdminUpdateManyWithoutOrganisationNestedInput
  }

  export type OrganisationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    branding?: NullableJsonNullValueInput | InputJsonValue
    features?: NullableJsonNullValueInput | InputJsonValue
    ownerId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    admins?: OrganisationAdminUncheckedUpdateManyWithoutOrganisationNestedInput
  }

  export type OrganisationCreateManyInput = {
    id?: string
    name: string
    slug: string
    branding?: NullableJsonNullValueInput | InputJsonValue
    features?: NullableJsonNullValueInput | InputJsonValue
    ownerId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrganisationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    branding?: NullableJsonNullValueInput | InputJsonValue
    features?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganisationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    branding?: NullableJsonNullValueInput | InputJsonValue
    features?: NullableJsonNullValueInput | InputJsonValue
    ownerId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganisationAdminCreateInput = {
    id?: string
    role?: string
    createdAt?: Date | string
    organisation: OrganisationCreateNestedOneWithoutAdminsInput
    globalUser: GlobalUserCreateNestedOneWithoutOrganisationAdminsInput
  }

  export type OrganisationAdminUncheckedCreateInput = {
    id?: string
    organisationId: string
    globalUserId: string
    role?: string
    createdAt?: Date | string
  }

  export type OrganisationAdminUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organisation?: OrganisationUpdateOneRequiredWithoutAdminsNestedInput
    globalUser?: GlobalUserUpdateOneRequiredWithoutOrganisationAdminsNestedInput
  }

  export type OrganisationAdminUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    organisationId?: StringFieldUpdateOperationsInput | string
    globalUserId?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganisationAdminCreateManyInput = {
    id?: string
    organisationId: string
    globalUserId: string
    role?: string
    createdAt?: Date | string
  }

  export type OrganisationAdminUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganisationAdminUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    organisationId?: StringFieldUpdateOperationsInput | string
    globalUserId?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NoteCreateInput = {
    id?: string
    tenantId: string
    title: string
    body?: string | null
    createdBy: string
    createdAt?: Date | string
  }

  export type NoteUncheckedCreateInput = {
    id?: string
    tenantId: string
    title: string
    body?: string | null
    createdBy: string
    createdAt?: Date | string
  }

  export type NoteUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    body?: NullableStringFieldUpdateOperationsInput | string | null
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NoteUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    body?: NullableStringFieldUpdateOperationsInput | string | null
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NoteCreateManyInput = {
    id?: string
    tenantId: string
    title: string
    body?: string | null
    createdBy: string
    createdAt?: Date | string
  }

  export type NoteUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    body?: NullableStringFieldUpdateOperationsInput | string | null
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NoteUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    body?: NullableStringFieldUpdateOperationsInput | string | null
    createdBy?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrgUserCreateInput = {
    id?: string
    tenantId: string
    email: string
    passwordHash: string
    displayName: string
    isActive?: boolean
    totpSecret?: string | null
    isTotpEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    roles?: OrgUserRoleCreateNestedManyWithoutOrgUserInput
    auditLogs?: AuditLogCreateNestedManyWithoutOrgUserInput
  }

  export type OrgUserUncheckedCreateInput = {
    id?: string
    tenantId: string
    email: string
    passwordHash: string
    displayName: string
    isActive?: boolean
    totpSecret?: string | null
    isTotpEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    roles?: OrgUserRoleUncheckedCreateNestedManyWithoutOrgUserInput
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutOrgUserInput
  }

  export type OrgUserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    totpSecret?: NullableStringFieldUpdateOperationsInput | string | null
    isTotpEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    roles?: OrgUserRoleUpdateManyWithoutOrgUserNestedInput
    auditLogs?: AuditLogUpdateManyWithoutOrgUserNestedInput
  }

  export type OrgUserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    totpSecret?: NullableStringFieldUpdateOperationsInput | string | null
    isTotpEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    roles?: OrgUserRoleUncheckedUpdateManyWithoutOrgUserNestedInput
    auditLogs?: AuditLogUncheckedUpdateManyWithoutOrgUserNestedInput
  }

  export type OrgUserCreateManyInput = {
    id?: string
    tenantId: string
    email: string
    passwordHash: string
    displayName: string
    isActive?: boolean
    totpSecret?: string | null
    isTotpEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrgUserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    totpSecret?: NullableStringFieldUpdateOperationsInput | string | null
    isTotpEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrgUserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    totpSecret?: NullableStringFieldUpdateOperationsInput | string | null
    isTotpEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RoleCreateInput = {
    id?: string
    tenantId: string
    name: string
    desc?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    permissions?: RolePermissionCreateNestedManyWithoutRoleInput
    users?: OrgUserRoleCreateNestedManyWithoutRoleInput
  }

  export type RoleUncheckedCreateInput = {
    id?: string
    tenantId: string
    name: string
    desc?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    permissions?: RolePermissionUncheckedCreateNestedManyWithoutRoleInput
    users?: OrgUserRoleUncheckedCreateNestedManyWithoutRoleInput
  }

  export type RoleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    desc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permissions?: RolePermissionUpdateManyWithoutRoleNestedInput
    users?: OrgUserRoleUpdateManyWithoutRoleNestedInput
  }

  export type RoleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    desc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permissions?: RolePermissionUncheckedUpdateManyWithoutRoleNestedInput
    users?: OrgUserRoleUncheckedUpdateManyWithoutRoleNestedInput
  }

  export type RoleCreateManyInput = {
    id?: string
    tenantId: string
    name: string
    desc?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RoleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    desc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RoleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    desc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PermissionCreateInput = {
    id?: string
    tenantId: string
    key: string
    group?: string | null
    desc?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    roles?: RolePermissionCreateNestedManyWithoutPermissionInput
  }

  export type PermissionUncheckedCreateInput = {
    id?: string
    tenantId: string
    key: string
    group?: string | null
    desc?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    roles?: RolePermissionUncheckedCreateNestedManyWithoutPermissionInput
  }

  export type PermissionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    group?: NullableStringFieldUpdateOperationsInput | string | null
    desc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    roles?: RolePermissionUpdateManyWithoutPermissionNestedInput
  }

  export type PermissionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    group?: NullableStringFieldUpdateOperationsInput | string | null
    desc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    roles?: RolePermissionUncheckedUpdateManyWithoutPermissionNestedInput
  }

  export type PermissionCreateManyInput = {
    id?: string
    tenantId: string
    key: string
    group?: string | null
    desc?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PermissionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    group?: NullableStringFieldUpdateOperationsInput | string | null
    desc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PermissionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    group?: NullableStringFieldUpdateOperationsInput | string | null
    desc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RolePermissionCreateInput = {
    id?: string
    tenantId: string
    createdAt?: Date | string
    role: RoleCreateNestedOneWithoutPermissionsInput
    permission: PermissionCreateNestedOneWithoutRolesInput
  }

  export type RolePermissionUncheckedCreateInput = {
    id?: string
    tenantId: string
    roleId: string
    permissionId: string
    createdAt?: Date | string
  }

  export type RolePermissionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: RoleUpdateOneRequiredWithoutPermissionsNestedInput
    permission?: PermissionUpdateOneRequiredWithoutRolesNestedInput
  }

  export type RolePermissionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    roleId?: StringFieldUpdateOperationsInput | string
    permissionId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RolePermissionCreateManyInput = {
    id?: string
    tenantId: string
    roleId: string
    permissionId: string
    createdAt?: Date | string
  }

  export type RolePermissionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RolePermissionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    roleId?: StringFieldUpdateOperationsInput | string
    permissionId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrgUserRoleCreateInput = {
    id?: string
    tenantId: string
    createdAt?: Date | string
    orgUser: OrgUserCreateNestedOneWithoutRolesInput
    role: RoleCreateNestedOneWithoutUsersInput
  }

  export type OrgUserRoleUncheckedCreateInput = {
    id?: string
    tenantId: string
    orgUserId: string
    roleId: string
    createdAt?: Date | string
  }

  export type OrgUserRoleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orgUser?: OrgUserUpdateOneRequiredWithoutRolesNestedInput
    role?: RoleUpdateOneRequiredWithoutUsersNestedInput
  }

  export type OrgUserRoleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    orgUserId?: StringFieldUpdateOperationsInput | string
    roleId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrgUserRoleCreateManyInput = {
    id?: string
    tenantId: string
    orgUserId: string
    roleId: string
    createdAt?: Date | string
  }

  export type OrgUserRoleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrgUserRoleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    orgUserId?: StringFieldUpdateOperationsInput | string
    roleId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrgInviteCreateInput = {
    id?: string
    tenantId: string
    email: string
    invitedById: string
    rolesJson?: JsonNullValueInput | InputJsonValue
    tokenHash: string
    expiresAt: Date | string
    acceptedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type OrgInviteUncheckedCreateInput = {
    id?: string
    tenantId: string
    email: string
    invitedById: string
    rolesJson?: JsonNullValueInput | InputJsonValue
    tokenHash: string
    expiresAt: Date | string
    acceptedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type OrgInviteUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    invitedById?: StringFieldUpdateOperationsInput | string
    rolesJson?: JsonNullValueInput | InputJsonValue
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    acceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrgInviteUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    invitedById?: StringFieldUpdateOperationsInput | string
    rolesJson?: JsonNullValueInput | InputJsonValue
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    acceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrgInviteCreateManyInput = {
    id?: string
    tenantId: string
    email: string
    invitedById: string
    rolesJson?: JsonNullValueInput | InputJsonValue
    tokenHash: string
    expiresAt: Date | string
    acceptedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type OrgInviteUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    invitedById?: StringFieldUpdateOperationsInput | string
    rolesJson?: JsonNullValueInput | InputJsonValue
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    acceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrgInviteUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    invitedById?: StringFieldUpdateOperationsInput | string
    rolesJson?: JsonNullValueInput | InputJsonValue
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    acceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogCreateInput = {
    id?: string
    tenantId: string
    action: $Enums.AuditAction
    entityType: $Enums.AuditEntityType
    entityId: string
    details?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
    user?: GlobalUserCreateNestedOneWithoutAuditLogsInput
    orgUser?: OrgUserCreateNestedOneWithoutAuditLogsInput
  }

  export type AuditLogUncheckedCreateInput = {
    id?: string
    tenantId: string
    action: $Enums.AuditAction
    entityType: $Enums.AuditEntityType
    entityId: string
    userId?: string | null
    orgUserId?: string | null
    details?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
  }

  export type AuditLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    action?: EnumAuditActionFieldUpdateOperationsInput | $Enums.AuditAction
    entityType?: EnumAuditEntityTypeFieldUpdateOperationsInput | $Enums.AuditEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: GlobalUserUpdateOneWithoutAuditLogsNestedInput
    orgUser?: OrgUserUpdateOneWithoutAuditLogsNestedInput
  }

  export type AuditLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    action?: EnumAuditActionFieldUpdateOperationsInput | $Enums.AuditAction
    entityType?: EnumAuditEntityTypeFieldUpdateOperationsInput | $Enums.AuditEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    orgUserId?: NullableStringFieldUpdateOperationsInput | string | null
    details?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogCreateManyInput = {
    id?: string
    tenantId: string
    action: $Enums.AuditAction
    entityType: $Enums.AuditEntityType
    entityId: string
    userId?: string | null
    orgUserId?: string | null
    details?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
  }

  export type AuditLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    action?: EnumAuditActionFieldUpdateOperationsInput | $Enums.AuditAction
    entityType?: EnumAuditEntityTypeFieldUpdateOperationsInput | $Enums.AuditEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    action?: EnumAuditActionFieldUpdateOperationsInput | $Enums.AuditAction
    entityType?: EnumAuditEntityTypeFieldUpdateOperationsInput | $Enums.AuditEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    orgUserId?: NullableStringFieldUpdateOperationsInput | string | null
    details?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type OrganisationListRelationFilter = {
    every?: OrganisationWhereInput
    some?: OrganisationWhereInput
    none?: OrganisationWhereInput
  }

  export type OrganisationAdminListRelationFilter = {
    every?: OrganisationAdminWhereInput
    some?: OrganisationAdminWhereInput
    none?: OrganisationAdminWhereInput
  }

  export type AuditLogListRelationFilter = {
    every?: AuditLogWhereInput
    some?: AuditLogWhereInput
    none?: AuditLogWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type OrganisationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OrganisationAdminOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AuditLogOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type GlobalUserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    totpSecret?: SortOrder
    isTotpEnabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GlobalUserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    totpSecret?: SortOrder
    isTotpEnabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GlobalUserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    totpSecret?: SortOrder
    isTotpEnabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type GlobalUserScalarRelationFilter = {
    is?: GlobalUserWhereInput
    isNot?: GlobalUserWhereInput
  }

  export type OrganisationCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    branding?: SortOrder
    features?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrganisationMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrganisationMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    ownerId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type OrganisationScalarRelationFilter = {
    is?: OrganisationWhereInput
    isNot?: OrganisationWhereInput
  }

  export type OrganisationAdminOrganisationIdGlobalUserIdCompoundUniqueInput = {
    organisationId: string
    globalUserId: string
  }

  export type OrganisationAdminCountOrderByAggregateInput = {
    id?: SortOrder
    organisationId?: SortOrder
    globalUserId?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
  }

  export type OrganisationAdminMaxOrderByAggregateInput = {
    id?: SortOrder
    organisationId?: SortOrder
    globalUserId?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
  }

  export type OrganisationAdminMinOrderByAggregateInput = {
    id?: SortOrder
    organisationId?: SortOrder
    globalUserId?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
  }

  export type NoteCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    title?: SortOrder
    body?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
  }

  export type NoteMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    title?: SortOrder
    body?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
  }

  export type NoteMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    title?: SortOrder
    body?: SortOrder
    createdBy?: SortOrder
    createdAt?: SortOrder
  }

  export type OrgUserRoleListRelationFilter = {
    every?: OrgUserRoleWhereInput
    some?: OrgUserRoleWhereInput
    none?: OrgUserRoleWhereInput
  }

  export type OrgUserRoleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OrgUserTenantIdEmailCompoundUniqueInput = {
    tenantId: string
    email: string
  }

  export type OrgUserCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    displayName?: SortOrder
    isActive?: SortOrder
    totpSecret?: SortOrder
    isTotpEnabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrgUserMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    displayName?: SortOrder
    isActive?: SortOrder
    totpSecret?: SortOrder
    isTotpEnabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrgUserMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    displayName?: SortOrder
    isActive?: SortOrder
    totpSecret?: SortOrder
    isTotpEnabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RolePermissionListRelationFilter = {
    every?: RolePermissionWhereInput
    some?: RolePermissionWhereInput
    none?: RolePermissionWhereInput
  }

  export type RolePermissionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RoleTenantIdNameCompoundUniqueInput = {
    tenantId: string
    name: string
  }

  export type RoleCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    desc?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RoleMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    desc?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RoleMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    desc?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PermissionTenantIdKeyCompoundUniqueInput = {
    tenantId: string
    key: string
  }

  export type PermissionCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    key?: SortOrder
    group?: SortOrder
    desc?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PermissionMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    key?: SortOrder
    group?: SortOrder
    desc?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PermissionMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    key?: SortOrder
    group?: SortOrder
    desc?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RoleScalarRelationFilter = {
    is?: RoleWhereInput
    isNot?: RoleWhereInput
  }

  export type PermissionScalarRelationFilter = {
    is?: PermissionWhereInput
    isNot?: PermissionWhereInput
  }

  export type RolePermissionTenantIdRoleIdPermissionIdCompoundUniqueInput = {
    tenantId: string
    roleId: string
    permissionId: string
  }

  export type RolePermissionCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    roleId?: SortOrder
    permissionId?: SortOrder
    createdAt?: SortOrder
  }

  export type RolePermissionMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    roleId?: SortOrder
    permissionId?: SortOrder
    createdAt?: SortOrder
  }

  export type RolePermissionMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    roleId?: SortOrder
    permissionId?: SortOrder
    createdAt?: SortOrder
  }

  export type OrgUserScalarRelationFilter = {
    is?: OrgUserWhereInput
    isNot?: OrgUserWhereInput
  }

  export type OrgUserRoleTenantIdOrgUserIdRoleIdCompoundUniqueInput = {
    tenantId: string
    orgUserId: string
    roleId: string
  }

  export type OrgUserRoleCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    orgUserId?: SortOrder
    roleId?: SortOrder
    createdAt?: SortOrder
  }

  export type OrgUserRoleMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    orgUserId?: SortOrder
    roleId?: SortOrder
    createdAt?: SortOrder
  }

  export type OrgUserRoleMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    orgUserId?: SortOrder
    roleId?: SortOrder
    createdAt?: SortOrder
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type OrgInviteTenantIdEmailAcceptedAtCompoundUniqueInput = {
    tenantId: string
    email: string
    acceptedAt: Date | string
  }

  export type OrgInviteCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    invitedById?: SortOrder
    rolesJson?: SortOrder
    tokenHash?: SortOrder
    expiresAt?: SortOrder
    acceptedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type OrgInviteMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    invitedById?: SortOrder
    tokenHash?: SortOrder
    expiresAt?: SortOrder
    acceptedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type OrgInviteMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    email?: SortOrder
    invitedById?: SortOrder
    tokenHash?: SortOrder
    expiresAt?: SortOrder
    acceptedAt?: SortOrder
    createdAt?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type EnumAuditActionFilter<$PrismaModel = never> = {
    equals?: $Enums.AuditAction | EnumAuditActionFieldRefInput<$PrismaModel>
    in?: $Enums.AuditAction[] | ListEnumAuditActionFieldRefInput<$PrismaModel>
    notIn?: $Enums.AuditAction[] | ListEnumAuditActionFieldRefInput<$PrismaModel>
    not?: NestedEnumAuditActionFilter<$PrismaModel> | $Enums.AuditAction
  }

  export type EnumAuditEntityTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.AuditEntityType | EnumAuditEntityTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AuditEntityType[] | ListEnumAuditEntityTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AuditEntityType[] | ListEnumAuditEntityTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAuditEntityTypeFilter<$PrismaModel> | $Enums.AuditEntityType
  }

  export type GlobalUserNullableScalarRelationFilter = {
    is?: GlobalUserWhereInput | null
    isNot?: GlobalUserWhereInput | null
  }

  export type OrgUserNullableScalarRelationFilter = {
    is?: OrgUserWhereInput | null
    isNot?: OrgUserWhereInput | null
  }

  export type AuditLogCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    action?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    userId?: SortOrder
    orgUserId?: SortOrder
    details?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    createdAt?: SortOrder
  }

  export type AuditLogMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    action?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    userId?: SortOrder
    orgUserId?: SortOrder
    details?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    createdAt?: SortOrder
  }

  export type AuditLogMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    action?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    userId?: SortOrder
    orgUserId?: SortOrder
    details?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumAuditActionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AuditAction | EnumAuditActionFieldRefInput<$PrismaModel>
    in?: $Enums.AuditAction[] | ListEnumAuditActionFieldRefInput<$PrismaModel>
    notIn?: $Enums.AuditAction[] | ListEnumAuditActionFieldRefInput<$PrismaModel>
    not?: NestedEnumAuditActionWithAggregatesFilter<$PrismaModel> | $Enums.AuditAction
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAuditActionFilter<$PrismaModel>
    _max?: NestedEnumAuditActionFilter<$PrismaModel>
  }

  export type EnumAuditEntityTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AuditEntityType | EnumAuditEntityTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AuditEntityType[] | ListEnumAuditEntityTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AuditEntityType[] | ListEnumAuditEntityTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAuditEntityTypeWithAggregatesFilter<$PrismaModel> | $Enums.AuditEntityType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAuditEntityTypeFilter<$PrismaModel>
    _max?: NestedEnumAuditEntityTypeFilter<$PrismaModel>
  }

  export type OrganisationCreateNestedManyWithoutOwnerInput = {
    create?: XOR<OrganisationCreateWithoutOwnerInput, OrganisationUncheckedCreateWithoutOwnerInput> | OrganisationCreateWithoutOwnerInput[] | OrganisationUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: OrganisationCreateOrConnectWithoutOwnerInput | OrganisationCreateOrConnectWithoutOwnerInput[]
    createMany?: OrganisationCreateManyOwnerInputEnvelope
    connect?: OrganisationWhereUniqueInput | OrganisationWhereUniqueInput[]
  }

  export type OrganisationAdminCreateNestedManyWithoutGlobalUserInput = {
    create?: XOR<OrganisationAdminCreateWithoutGlobalUserInput, OrganisationAdminUncheckedCreateWithoutGlobalUserInput> | OrganisationAdminCreateWithoutGlobalUserInput[] | OrganisationAdminUncheckedCreateWithoutGlobalUserInput[]
    connectOrCreate?: OrganisationAdminCreateOrConnectWithoutGlobalUserInput | OrganisationAdminCreateOrConnectWithoutGlobalUserInput[]
    createMany?: OrganisationAdminCreateManyGlobalUserInputEnvelope
    connect?: OrganisationAdminWhereUniqueInput | OrganisationAdminWhereUniqueInput[]
  }

  export type AuditLogCreateNestedManyWithoutUserInput = {
    create?: XOR<AuditLogCreateWithoutUserInput, AuditLogUncheckedCreateWithoutUserInput> | AuditLogCreateWithoutUserInput[] | AuditLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutUserInput | AuditLogCreateOrConnectWithoutUserInput[]
    createMany?: AuditLogCreateManyUserInputEnvelope
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
  }

  export type OrganisationUncheckedCreateNestedManyWithoutOwnerInput = {
    create?: XOR<OrganisationCreateWithoutOwnerInput, OrganisationUncheckedCreateWithoutOwnerInput> | OrganisationCreateWithoutOwnerInput[] | OrganisationUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: OrganisationCreateOrConnectWithoutOwnerInput | OrganisationCreateOrConnectWithoutOwnerInput[]
    createMany?: OrganisationCreateManyOwnerInputEnvelope
    connect?: OrganisationWhereUniqueInput | OrganisationWhereUniqueInput[]
  }

  export type OrganisationAdminUncheckedCreateNestedManyWithoutGlobalUserInput = {
    create?: XOR<OrganisationAdminCreateWithoutGlobalUserInput, OrganisationAdminUncheckedCreateWithoutGlobalUserInput> | OrganisationAdminCreateWithoutGlobalUserInput[] | OrganisationAdminUncheckedCreateWithoutGlobalUserInput[]
    connectOrCreate?: OrganisationAdminCreateOrConnectWithoutGlobalUserInput | OrganisationAdminCreateOrConnectWithoutGlobalUserInput[]
    createMany?: OrganisationAdminCreateManyGlobalUserInputEnvelope
    connect?: OrganisationAdminWhereUniqueInput | OrganisationAdminWhereUniqueInput[]
  }

  export type AuditLogUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<AuditLogCreateWithoutUserInput, AuditLogUncheckedCreateWithoutUserInput> | AuditLogCreateWithoutUserInput[] | AuditLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutUserInput | AuditLogCreateOrConnectWithoutUserInput[]
    createMany?: AuditLogCreateManyUserInputEnvelope
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type OrganisationUpdateManyWithoutOwnerNestedInput = {
    create?: XOR<OrganisationCreateWithoutOwnerInput, OrganisationUncheckedCreateWithoutOwnerInput> | OrganisationCreateWithoutOwnerInput[] | OrganisationUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: OrganisationCreateOrConnectWithoutOwnerInput | OrganisationCreateOrConnectWithoutOwnerInput[]
    upsert?: OrganisationUpsertWithWhereUniqueWithoutOwnerInput | OrganisationUpsertWithWhereUniqueWithoutOwnerInput[]
    createMany?: OrganisationCreateManyOwnerInputEnvelope
    set?: OrganisationWhereUniqueInput | OrganisationWhereUniqueInput[]
    disconnect?: OrganisationWhereUniqueInput | OrganisationWhereUniqueInput[]
    delete?: OrganisationWhereUniqueInput | OrganisationWhereUniqueInput[]
    connect?: OrganisationWhereUniqueInput | OrganisationWhereUniqueInput[]
    update?: OrganisationUpdateWithWhereUniqueWithoutOwnerInput | OrganisationUpdateWithWhereUniqueWithoutOwnerInput[]
    updateMany?: OrganisationUpdateManyWithWhereWithoutOwnerInput | OrganisationUpdateManyWithWhereWithoutOwnerInput[]
    deleteMany?: OrganisationScalarWhereInput | OrganisationScalarWhereInput[]
  }

  export type OrganisationAdminUpdateManyWithoutGlobalUserNestedInput = {
    create?: XOR<OrganisationAdminCreateWithoutGlobalUserInput, OrganisationAdminUncheckedCreateWithoutGlobalUserInput> | OrganisationAdminCreateWithoutGlobalUserInput[] | OrganisationAdminUncheckedCreateWithoutGlobalUserInput[]
    connectOrCreate?: OrganisationAdminCreateOrConnectWithoutGlobalUserInput | OrganisationAdminCreateOrConnectWithoutGlobalUserInput[]
    upsert?: OrganisationAdminUpsertWithWhereUniqueWithoutGlobalUserInput | OrganisationAdminUpsertWithWhereUniqueWithoutGlobalUserInput[]
    createMany?: OrganisationAdminCreateManyGlobalUserInputEnvelope
    set?: OrganisationAdminWhereUniqueInput | OrganisationAdminWhereUniqueInput[]
    disconnect?: OrganisationAdminWhereUniqueInput | OrganisationAdminWhereUniqueInput[]
    delete?: OrganisationAdminWhereUniqueInput | OrganisationAdminWhereUniqueInput[]
    connect?: OrganisationAdminWhereUniqueInput | OrganisationAdminWhereUniqueInput[]
    update?: OrganisationAdminUpdateWithWhereUniqueWithoutGlobalUserInput | OrganisationAdminUpdateWithWhereUniqueWithoutGlobalUserInput[]
    updateMany?: OrganisationAdminUpdateManyWithWhereWithoutGlobalUserInput | OrganisationAdminUpdateManyWithWhereWithoutGlobalUserInput[]
    deleteMany?: OrganisationAdminScalarWhereInput | OrganisationAdminScalarWhereInput[]
  }

  export type AuditLogUpdateManyWithoutUserNestedInput = {
    create?: XOR<AuditLogCreateWithoutUserInput, AuditLogUncheckedCreateWithoutUserInput> | AuditLogCreateWithoutUserInput[] | AuditLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutUserInput | AuditLogCreateOrConnectWithoutUserInput[]
    upsert?: AuditLogUpsertWithWhereUniqueWithoutUserInput | AuditLogUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AuditLogCreateManyUserInputEnvelope
    set?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    disconnect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    delete?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    update?: AuditLogUpdateWithWhereUniqueWithoutUserInput | AuditLogUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AuditLogUpdateManyWithWhereWithoutUserInput | AuditLogUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
  }

  export type OrganisationUncheckedUpdateManyWithoutOwnerNestedInput = {
    create?: XOR<OrganisationCreateWithoutOwnerInput, OrganisationUncheckedCreateWithoutOwnerInput> | OrganisationCreateWithoutOwnerInput[] | OrganisationUncheckedCreateWithoutOwnerInput[]
    connectOrCreate?: OrganisationCreateOrConnectWithoutOwnerInput | OrganisationCreateOrConnectWithoutOwnerInput[]
    upsert?: OrganisationUpsertWithWhereUniqueWithoutOwnerInput | OrganisationUpsertWithWhereUniqueWithoutOwnerInput[]
    createMany?: OrganisationCreateManyOwnerInputEnvelope
    set?: OrganisationWhereUniqueInput | OrganisationWhereUniqueInput[]
    disconnect?: OrganisationWhereUniqueInput | OrganisationWhereUniqueInput[]
    delete?: OrganisationWhereUniqueInput | OrganisationWhereUniqueInput[]
    connect?: OrganisationWhereUniqueInput | OrganisationWhereUniqueInput[]
    update?: OrganisationUpdateWithWhereUniqueWithoutOwnerInput | OrganisationUpdateWithWhereUniqueWithoutOwnerInput[]
    updateMany?: OrganisationUpdateManyWithWhereWithoutOwnerInput | OrganisationUpdateManyWithWhereWithoutOwnerInput[]
    deleteMany?: OrganisationScalarWhereInput | OrganisationScalarWhereInput[]
  }

  export type OrganisationAdminUncheckedUpdateManyWithoutGlobalUserNestedInput = {
    create?: XOR<OrganisationAdminCreateWithoutGlobalUserInput, OrganisationAdminUncheckedCreateWithoutGlobalUserInput> | OrganisationAdminCreateWithoutGlobalUserInput[] | OrganisationAdminUncheckedCreateWithoutGlobalUserInput[]
    connectOrCreate?: OrganisationAdminCreateOrConnectWithoutGlobalUserInput | OrganisationAdminCreateOrConnectWithoutGlobalUserInput[]
    upsert?: OrganisationAdminUpsertWithWhereUniqueWithoutGlobalUserInput | OrganisationAdminUpsertWithWhereUniqueWithoutGlobalUserInput[]
    createMany?: OrganisationAdminCreateManyGlobalUserInputEnvelope
    set?: OrganisationAdminWhereUniqueInput | OrganisationAdminWhereUniqueInput[]
    disconnect?: OrganisationAdminWhereUniqueInput | OrganisationAdminWhereUniqueInput[]
    delete?: OrganisationAdminWhereUniqueInput | OrganisationAdminWhereUniqueInput[]
    connect?: OrganisationAdminWhereUniqueInput | OrganisationAdminWhereUniqueInput[]
    update?: OrganisationAdminUpdateWithWhereUniqueWithoutGlobalUserInput | OrganisationAdminUpdateWithWhereUniqueWithoutGlobalUserInput[]
    updateMany?: OrganisationAdminUpdateManyWithWhereWithoutGlobalUserInput | OrganisationAdminUpdateManyWithWhereWithoutGlobalUserInput[]
    deleteMany?: OrganisationAdminScalarWhereInput | OrganisationAdminScalarWhereInput[]
  }

  export type AuditLogUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<AuditLogCreateWithoutUserInput, AuditLogUncheckedCreateWithoutUserInput> | AuditLogCreateWithoutUserInput[] | AuditLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutUserInput | AuditLogCreateOrConnectWithoutUserInput[]
    upsert?: AuditLogUpsertWithWhereUniqueWithoutUserInput | AuditLogUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AuditLogCreateManyUserInputEnvelope
    set?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    disconnect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    delete?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    update?: AuditLogUpdateWithWhereUniqueWithoutUserInput | AuditLogUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AuditLogUpdateManyWithWhereWithoutUserInput | AuditLogUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
  }

  export type GlobalUserCreateNestedOneWithoutOrganisationsInput = {
    create?: XOR<GlobalUserCreateWithoutOrganisationsInput, GlobalUserUncheckedCreateWithoutOrganisationsInput>
    connectOrCreate?: GlobalUserCreateOrConnectWithoutOrganisationsInput
    connect?: GlobalUserWhereUniqueInput
  }

  export type OrganisationAdminCreateNestedManyWithoutOrganisationInput = {
    create?: XOR<OrganisationAdminCreateWithoutOrganisationInput, OrganisationAdminUncheckedCreateWithoutOrganisationInput> | OrganisationAdminCreateWithoutOrganisationInput[] | OrganisationAdminUncheckedCreateWithoutOrganisationInput[]
    connectOrCreate?: OrganisationAdminCreateOrConnectWithoutOrganisationInput | OrganisationAdminCreateOrConnectWithoutOrganisationInput[]
    createMany?: OrganisationAdminCreateManyOrganisationInputEnvelope
    connect?: OrganisationAdminWhereUniqueInput | OrganisationAdminWhereUniqueInput[]
  }

  export type OrganisationAdminUncheckedCreateNestedManyWithoutOrganisationInput = {
    create?: XOR<OrganisationAdminCreateWithoutOrganisationInput, OrganisationAdminUncheckedCreateWithoutOrganisationInput> | OrganisationAdminCreateWithoutOrganisationInput[] | OrganisationAdminUncheckedCreateWithoutOrganisationInput[]
    connectOrCreate?: OrganisationAdminCreateOrConnectWithoutOrganisationInput | OrganisationAdminCreateOrConnectWithoutOrganisationInput[]
    createMany?: OrganisationAdminCreateManyOrganisationInputEnvelope
    connect?: OrganisationAdminWhereUniqueInput | OrganisationAdminWhereUniqueInput[]
  }

  export type GlobalUserUpdateOneRequiredWithoutOrganisationsNestedInput = {
    create?: XOR<GlobalUserCreateWithoutOrganisationsInput, GlobalUserUncheckedCreateWithoutOrganisationsInput>
    connectOrCreate?: GlobalUserCreateOrConnectWithoutOrganisationsInput
    upsert?: GlobalUserUpsertWithoutOrganisationsInput
    connect?: GlobalUserWhereUniqueInput
    update?: XOR<XOR<GlobalUserUpdateToOneWithWhereWithoutOrganisationsInput, GlobalUserUpdateWithoutOrganisationsInput>, GlobalUserUncheckedUpdateWithoutOrganisationsInput>
  }

  export type OrganisationAdminUpdateManyWithoutOrganisationNestedInput = {
    create?: XOR<OrganisationAdminCreateWithoutOrganisationInput, OrganisationAdminUncheckedCreateWithoutOrganisationInput> | OrganisationAdminCreateWithoutOrganisationInput[] | OrganisationAdminUncheckedCreateWithoutOrganisationInput[]
    connectOrCreate?: OrganisationAdminCreateOrConnectWithoutOrganisationInput | OrganisationAdminCreateOrConnectWithoutOrganisationInput[]
    upsert?: OrganisationAdminUpsertWithWhereUniqueWithoutOrganisationInput | OrganisationAdminUpsertWithWhereUniqueWithoutOrganisationInput[]
    createMany?: OrganisationAdminCreateManyOrganisationInputEnvelope
    set?: OrganisationAdminWhereUniqueInput | OrganisationAdminWhereUniqueInput[]
    disconnect?: OrganisationAdminWhereUniqueInput | OrganisationAdminWhereUniqueInput[]
    delete?: OrganisationAdminWhereUniqueInput | OrganisationAdminWhereUniqueInput[]
    connect?: OrganisationAdminWhereUniqueInput | OrganisationAdminWhereUniqueInput[]
    update?: OrganisationAdminUpdateWithWhereUniqueWithoutOrganisationInput | OrganisationAdminUpdateWithWhereUniqueWithoutOrganisationInput[]
    updateMany?: OrganisationAdminUpdateManyWithWhereWithoutOrganisationInput | OrganisationAdminUpdateManyWithWhereWithoutOrganisationInput[]
    deleteMany?: OrganisationAdminScalarWhereInput | OrganisationAdminScalarWhereInput[]
  }

  export type OrganisationAdminUncheckedUpdateManyWithoutOrganisationNestedInput = {
    create?: XOR<OrganisationAdminCreateWithoutOrganisationInput, OrganisationAdminUncheckedCreateWithoutOrganisationInput> | OrganisationAdminCreateWithoutOrganisationInput[] | OrganisationAdminUncheckedCreateWithoutOrganisationInput[]
    connectOrCreate?: OrganisationAdminCreateOrConnectWithoutOrganisationInput | OrganisationAdminCreateOrConnectWithoutOrganisationInput[]
    upsert?: OrganisationAdminUpsertWithWhereUniqueWithoutOrganisationInput | OrganisationAdminUpsertWithWhereUniqueWithoutOrganisationInput[]
    createMany?: OrganisationAdminCreateManyOrganisationInputEnvelope
    set?: OrganisationAdminWhereUniqueInput | OrganisationAdminWhereUniqueInput[]
    disconnect?: OrganisationAdminWhereUniqueInput | OrganisationAdminWhereUniqueInput[]
    delete?: OrganisationAdminWhereUniqueInput | OrganisationAdminWhereUniqueInput[]
    connect?: OrganisationAdminWhereUniqueInput | OrganisationAdminWhereUniqueInput[]
    update?: OrganisationAdminUpdateWithWhereUniqueWithoutOrganisationInput | OrganisationAdminUpdateWithWhereUniqueWithoutOrganisationInput[]
    updateMany?: OrganisationAdminUpdateManyWithWhereWithoutOrganisationInput | OrganisationAdminUpdateManyWithWhereWithoutOrganisationInput[]
    deleteMany?: OrganisationAdminScalarWhereInput | OrganisationAdminScalarWhereInput[]
  }

  export type OrganisationCreateNestedOneWithoutAdminsInput = {
    create?: XOR<OrganisationCreateWithoutAdminsInput, OrganisationUncheckedCreateWithoutAdminsInput>
    connectOrCreate?: OrganisationCreateOrConnectWithoutAdminsInput
    connect?: OrganisationWhereUniqueInput
  }

  export type GlobalUserCreateNestedOneWithoutOrganisationAdminsInput = {
    create?: XOR<GlobalUserCreateWithoutOrganisationAdminsInput, GlobalUserUncheckedCreateWithoutOrganisationAdminsInput>
    connectOrCreate?: GlobalUserCreateOrConnectWithoutOrganisationAdminsInput
    connect?: GlobalUserWhereUniqueInput
  }

  export type OrganisationUpdateOneRequiredWithoutAdminsNestedInput = {
    create?: XOR<OrganisationCreateWithoutAdminsInput, OrganisationUncheckedCreateWithoutAdminsInput>
    connectOrCreate?: OrganisationCreateOrConnectWithoutAdminsInput
    upsert?: OrganisationUpsertWithoutAdminsInput
    connect?: OrganisationWhereUniqueInput
    update?: XOR<XOR<OrganisationUpdateToOneWithWhereWithoutAdminsInput, OrganisationUpdateWithoutAdminsInput>, OrganisationUncheckedUpdateWithoutAdminsInput>
  }

  export type GlobalUserUpdateOneRequiredWithoutOrganisationAdminsNestedInput = {
    create?: XOR<GlobalUserCreateWithoutOrganisationAdminsInput, GlobalUserUncheckedCreateWithoutOrganisationAdminsInput>
    connectOrCreate?: GlobalUserCreateOrConnectWithoutOrganisationAdminsInput
    upsert?: GlobalUserUpsertWithoutOrganisationAdminsInput
    connect?: GlobalUserWhereUniqueInput
    update?: XOR<XOR<GlobalUserUpdateToOneWithWhereWithoutOrganisationAdminsInput, GlobalUserUpdateWithoutOrganisationAdminsInput>, GlobalUserUncheckedUpdateWithoutOrganisationAdminsInput>
  }

  export type OrgUserRoleCreateNestedManyWithoutOrgUserInput = {
    create?: XOR<OrgUserRoleCreateWithoutOrgUserInput, OrgUserRoleUncheckedCreateWithoutOrgUserInput> | OrgUserRoleCreateWithoutOrgUserInput[] | OrgUserRoleUncheckedCreateWithoutOrgUserInput[]
    connectOrCreate?: OrgUserRoleCreateOrConnectWithoutOrgUserInput | OrgUserRoleCreateOrConnectWithoutOrgUserInput[]
    createMany?: OrgUserRoleCreateManyOrgUserInputEnvelope
    connect?: OrgUserRoleWhereUniqueInput | OrgUserRoleWhereUniqueInput[]
  }

  export type AuditLogCreateNestedManyWithoutOrgUserInput = {
    create?: XOR<AuditLogCreateWithoutOrgUserInput, AuditLogUncheckedCreateWithoutOrgUserInput> | AuditLogCreateWithoutOrgUserInput[] | AuditLogUncheckedCreateWithoutOrgUserInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutOrgUserInput | AuditLogCreateOrConnectWithoutOrgUserInput[]
    createMany?: AuditLogCreateManyOrgUserInputEnvelope
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
  }

  export type OrgUserRoleUncheckedCreateNestedManyWithoutOrgUserInput = {
    create?: XOR<OrgUserRoleCreateWithoutOrgUserInput, OrgUserRoleUncheckedCreateWithoutOrgUserInput> | OrgUserRoleCreateWithoutOrgUserInput[] | OrgUserRoleUncheckedCreateWithoutOrgUserInput[]
    connectOrCreate?: OrgUserRoleCreateOrConnectWithoutOrgUserInput | OrgUserRoleCreateOrConnectWithoutOrgUserInput[]
    createMany?: OrgUserRoleCreateManyOrgUserInputEnvelope
    connect?: OrgUserRoleWhereUniqueInput | OrgUserRoleWhereUniqueInput[]
  }

  export type AuditLogUncheckedCreateNestedManyWithoutOrgUserInput = {
    create?: XOR<AuditLogCreateWithoutOrgUserInput, AuditLogUncheckedCreateWithoutOrgUserInput> | AuditLogCreateWithoutOrgUserInput[] | AuditLogUncheckedCreateWithoutOrgUserInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutOrgUserInput | AuditLogCreateOrConnectWithoutOrgUserInput[]
    createMany?: AuditLogCreateManyOrgUserInputEnvelope
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
  }

  export type OrgUserRoleUpdateManyWithoutOrgUserNestedInput = {
    create?: XOR<OrgUserRoleCreateWithoutOrgUserInput, OrgUserRoleUncheckedCreateWithoutOrgUserInput> | OrgUserRoleCreateWithoutOrgUserInput[] | OrgUserRoleUncheckedCreateWithoutOrgUserInput[]
    connectOrCreate?: OrgUserRoleCreateOrConnectWithoutOrgUserInput | OrgUserRoleCreateOrConnectWithoutOrgUserInput[]
    upsert?: OrgUserRoleUpsertWithWhereUniqueWithoutOrgUserInput | OrgUserRoleUpsertWithWhereUniqueWithoutOrgUserInput[]
    createMany?: OrgUserRoleCreateManyOrgUserInputEnvelope
    set?: OrgUserRoleWhereUniqueInput | OrgUserRoleWhereUniqueInput[]
    disconnect?: OrgUserRoleWhereUniqueInput | OrgUserRoleWhereUniqueInput[]
    delete?: OrgUserRoleWhereUniqueInput | OrgUserRoleWhereUniqueInput[]
    connect?: OrgUserRoleWhereUniqueInput | OrgUserRoleWhereUniqueInput[]
    update?: OrgUserRoleUpdateWithWhereUniqueWithoutOrgUserInput | OrgUserRoleUpdateWithWhereUniqueWithoutOrgUserInput[]
    updateMany?: OrgUserRoleUpdateManyWithWhereWithoutOrgUserInput | OrgUserRoleUpdateManyWithWhereWithoutOrgUserInput[]
    deleteMany?: OrgUserRoleScalarWhereInput | OrgUserRoleScalarWhereInput[]
  }

  export type AuditLogUpdateManyWithoutOrgUserNestedInput = {
    create?: XOR<AuditLogCreateWithoutOrgUserInput, AuditLogUncheckedCreateWithoutOrgUserInput> | AuditLogCreateWithoutOrgUserInput[] | AuditLogUncheckedCreateWithoutOrgUserInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutOrgUserInput | AuditLogCreateOrConnectWithoutOrgUserInput[]
    upsert?: AuditLogUpsertWithWhereUniqueWithoutOrgUserInput | AuditLogUpsertWithWhereUniqueWithoutOrgUserInput[]
    createMany?: AuditLogCreateManyOrgUserInputEnvelope
    set?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    disconnect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    delete?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    update?: AuditLogUpdateWithWhereUniqueWithoutOrgUserInput | AuditLogUpdateWithWhereUniqueWithoutOrgUserInput[]
    updateMany?: AuditLogUpdateManyWithWhereWithoutOrgUserInput | AuditLogUpdateManyWithWhereWithoutOrgUserInput[]
    deleteMany?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
  }

  export type OrgUserRoleUncheckedUpdateManyWithoutOrgUserNestedInput = {
    create?: XOR<OrgUserRoleCreateWithoutOrgUserInput, OrgUserRoleUncheckedCreateWithoutOrgUserInput> | OrgUserRoleCreateWithoutOrgUserInput[] | OrgUserRoleUncheckedCreateWithoutOrgUserInput[]
    connectOrCreate?: OrgUserRoleCreateOrConnectWithoutOrgUserInput | OrgUserRoleCreateOrConnectWithoutOrgUserInput[]
    upsert?: OrgUserRoleUpsertWithWhereUniqueWithoutOrgUserInput | OrgUserRoleUpsertWithWhereUniqueWithoutOrgUserInput[]
    createMany?: OrgUserRoleCreateManyOrgUserInputEnvelope
    set?: OrgUserRoleWhereUniqueInput | OrgUserRoleWhereUniqueInput[]
    disconnect?: OrgUserRoleWhereUniqueInput | OrgUserRoleWhereUniqueInput[]
    delete?: OrgUserRoleWhereUniqueInput | OrgUserRoleWhereUniqueInput[]
    connect?: OrgUserRoleWhereUniqueInput | OrgUserRoleWhereUniqueInput[]
    update?: OrgUserRoleUpdateWithWhereUniqueWithoutOrgUserInput | OrgUserRoleUpdateWithWhereUniqueWithoutOrgUserInput[]
    updateMany?: OrgUserRoleUpdateManyWithWhereWithoutOrgUserInput | OrgUserRoleUpdateManyWithWhereWithoutOrgUserInput[]
    deleteMany?: OrgUserRoleScalarWhereInput | OrgUserRoleScalarWhereInput[]
  }

  export type AuditLogUncheckedUpdateManyWithoutOrgUserNestedInput = {
    create?: XOR<AuditLogCreateWithoutOrgUserInput, AuditLogUncheckedCreateWithoutOrgUserInput> | AuditLogCreateWithoutOrgUserInput[] | AuditLogUncheckedCreateWithoutOrgUserInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutOrgUserInput | AuditLogCreateOrConnectWithoutOrgUserInput[]
    upsert?: AuditLogUpsertWithWhereUniqueWithoutOrgUserInput | AuditLogUpsertWithWhereUniqueWithoutOrgUserInput[]
    createMany?: AuditLogCreateManyOrgUserInputEnvelope
    set?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    disconnect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    delete?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    update?: AuditLogUpdateWithWhereUniqueWithoutOrgUserInput | AuditLogUpdateWithWhereUniqueWithoutOrgUserInput[]
    updateMany?: AuditLogUpdateManyWithWhereWithoutOrgUserInput | AuditLogUpdateManyWithWhereWithoutOrgUserInput[]
    deleteMany?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
  }

  export type RolePermissionCreateNestedManyWithoutRoleInput = {
    create?: XOR<RolePermissionCreateWithoutRoleInput, RolePermissionUncheckedCreateWithoutRoleInput> | RolePermissionCreateWithoutRoleInput[] | RolePermissionUncheckedCreateWithoutRoleInput[]
    connectOrCreate?: RolePermissionCreateOrConnectWithoutRoleInput | RolePermissionCreateOrConnectWithoutRoleInput[]
    createMany?: RolePermissionCreateManyRoleInputEnvelope
    connect?: RolePermissionWhereUniqueInput | RolePermissionWhereUniqueInput[]
  }

  export type OrgUserRoleCreateNestedManyWithoutRoleInput = {
    create?: XOR<OrgUserRoleCreateWithoutRoleInput, OrgUserRoleUncheckedCreateWithoutRoleInput> | OrgUserRoleCreateWithoutRoleInput[] | OrgUserRoleUncheckedCreateWithoutRoleInput[]
    connectOrCreate?: OrgUserRoleCreateOrConnectWithoutRoleInput | OrgUserRoleCreateOrConnectWithoutRoleInput[]
    createMany?: OrgUserRoleCreateManyRoleInputEnvelope
    connect?: OrgUserRoleWhereUniqueInput | OrgUserRoleWhereUniqueInput[]
  }

  export type RolePermissionUncheckedCreateNestedManyWithoutRoleInput = {
    create?: XOR<RolePermissionCreateWithoutRoleInput, RolePermissionUncheckedCreateWithoutRoleInput> | RolePermissionCreateWithoutRoleInput[] | RolePermissionUncheckedCreateWithoutRoleInput[]
    connectOrCreate?: RolePermissionCreateOrConnectWithoutRoleInput | RolePermissionCreateOrConnectWithoutRoleInput[]
    createMany?: RolePermissionCreateManyRoleInputEnvelope
    connect?: RolePermissionWhereUniqueInput | RolePermissionWhereUniqueInput[]
  }

  export type OrgUserRoleUncheckedCreateNestedManyWithoutRoleInput = {
    create?: XOR<OrgUserRoleCreateWithoutRoleInput, OrgUserRoleUncheckedCreateWithoutRoleInput> | OrgUserRoleCreateWithoutRoleInput[] | OrgUserRoleUncheckedCreateWithoutRoleInput[]
    connectOrCreate?: OrgUserRoleCreateOrConnectWithoutRoleInput | OrgUserRoleCreateOrConnectWithoutRoleInput[]
    createMany?: OrgUserRoleCreateManyRoleInputEnvelope
    connect?: OrgUserRoleWhereUniqueInput | OrgUserRoleWhereUniqueInput[]
  }

  export type RolePermissionUpdateManyWithoutRoleNestedInput = {
    create?: XOR<RolePermissionCreateWithoutRoleInput, RolePermissionUncheckedCreateWithoutRoleInput> | RolePermissionCreateWithoutRoleInput[] | RolePermissionUncheckedCreateWithoutRoleInput[]
    connectOrCreate?: RolePermissionCreateOrConnectWithoutRoleInput | RolePermissionCreateOrConnectWithoutRoleInput[]
    upsert?: RolePermissionUpsertWithWhereUniqueWithoutRoleInput | RolePermissionUpsertWithWhereUniqueWithoutRoleInput[]
    createMany?: RolePermissionCreateManyRoleInputEnvelope
    set?: RolePermissionWhereUniqueInput | RolePermissionWhereUniqueInput[]
    disconnect?: RolePermissionWhereUniqueInput | RolePermissionWhereUniqueInput[]
    delete?: RolePermissionWhereUniqueInput | RolePermissionWhereUniqueInput[]
    connect?: RolePermissionWhereUniqueInput | RolePermissionWhereUniqueInput[]
    update?: RolePermissionUpdateWithWhereUniqueWithoutRoleInput | RolePermissionUpdateWithWhereUniqueWithoutRoleInput[]
    updateMany?: RolePermissionUpdateManyWithWhereWithoutRoleInput | RolePermissionUpdateManyWithWhereWithoutRoleInput[]
    deleteMany?: RolePermissionScalarWhereInput | RolePermissionScalarWhereInput[]
  }

  export type OrgUserRoleUpdateManyWithoutRoleNestedInput = {
    create?: XOR<OrgUserRoleCreateWithoutRoleInput, OrgUserRoleUncheckedCreateWithoutRoleInput> | OrgUserRoleCreateWithoutRoleInput[] | OrgUserRoleUncheckedCreateWithoutRoleInput[]
    connectOrCreate?: OrgUserRoleCreateOrConnectWithoutRoleInput | OrgUserRoleCreateOrConnectWithoutRoleInput[]
    upsert?: OrgUserRoleUpsertWithWhereUniqueWithoutRoleInput | OrgUserRoleUpsertWithWhereUniqueWithoutRoleInput[]
    createMany?: OrgUserRoleCreateManyRoleInputEnvelope
    set?: OrgUserRoleWhereUniqueInput | OrgUserRoleWhereUniqueInput[]
    disconnect?: OrgUserRoleWhereUniqueInput | OrgUserRoleWhereUniqueInput[]
    delete?: OrgUserRoleWhereUniqueInput | OrgUserRoleWhereUniqueInput[]
    connect?: OrgUserRoleWhereUniqueInput | OrgUserRoleWhereUniqueInput[]
    update?: OrgUserRoleUpdateWithWhereUniqueWithoutRoleInput | OrgUserRoleUpdateWithWhereUniqueWithoutRoleInput[]
    updateMany?: OrgUserRoleUpdateManyWithWhereWithoutRoleInput | OrgUserRoleUpdateManyWithWhereWithoutRoleInput[]
    deleteMany?: OrgUserRoleScalarWhereInput | OrgUserRoleScalarWhereInput[]
  }

  export type RolePermissionUncheckedUpdateManyWithoutRoleNestedInput = {
    create?: XOR<RolePermissionCreateWithoutRoleInput, RolePermissionUncheckedCreateWithoutRoleInput> | RolePermissionCreateWithoutRoleInput[] | RolePermissionUncheckedCreateWithoutRoleInput[]
    connectOrCreate?: RolePermissionCreateOrConnectWithoutRoleInput | RolePermissionCreateOrConnectWithoutRoleInput[]
    upsert?: RolePermissionUpsertWithWhereUniqueWithoutRoleInput | RolePermissionUpsertWithWhereUniqueWithoutRoleInput[]
    createMany?: RolePermissionCreateManyRoleInputEnvelope
    set?: RolePermissionWhereUniqueInput | RolePermissionWhereUniqueInput[]
    disconnect?: RolePermissionWhereUniqueInput | RolePermissionWhereUniqueInput[]
    delete?: RolePermissionWhereUniqueInput | RolePermissionWhereUniqueInput[]
    connect?: RolePermissionWhereUniqueInput | RolePermissionWhereUniqueInput[]
    update?: RolePermissionUpdateWithWhereUniqueWithoutRoleInput | RolePermissionUpdateWithWhereUniqueWithoutRoleInput[]
    updateMany?: RolePermissionUpdateManyWithWhereWithoutRoleInput | RolePermissionUpdateManyWithWhereWithoutRoleInput[]
    deleteMany?: RolePermissionScalarWhereInput | RolePermissionScalarWhereInput[]
  }

  export type OrgUserRoleUncheckedUpdateManyWithoutRoleNestedInput = {
    create?: XOR<OrgUserRoleCreateWithoutRoleInput, OrgUserRoleUncheckedCreateWithoutRoleInput> | OrgUserRoleCreateWithoutRoleInput[] | OrgUserRoleUncheckedCreateWithoutRoleInput[]
    connectOrCreate?: OrgUserRoleCreateOrConnectWithoutRoleInput | OrgUserRoleCreateOrConnectWithoutRoleInput[]
    upsert?: OrgUserRoleUpsertWithWhereUniqueWithoutRoleInput | OrgUserRoleUpsertWithWhereUniqueWithoutRoleInput[]
    createMany?: OrgUserRoleCreateManyRoleInputEnvelope
    set?: OrgUserRoleWhereUniqueInput | OrgUserRoleWhereUniqueInput[]
    disconnect?: OrgUserRoleWhereUniqueInput | OrgUserRoleWhereUniqueInput[]
    delete?: OrgUserRoleWhereUniqueInput | OrgUserRoleWhereUniqueInput[]
    connect?: OrgUserRoleWhereUniqueInput | OrgUserRoleWhereUniqueInput[]
    update?: OrgUserRoleUpdateWithWhereUniqueWithoutRoleInput | OrgUserRoleUpdateWithWhereUniqueWithoutRoleInput[]
    updateMany?: OrgUserRoleUpdateManyWithWhereWithoutRoleInput | OrgUserRoleUpdateManyWithWhereWithoutRoleInput[]
    deleteMany?: OrgUserRoleScalarWhereInput | OrgUserRoleScalarWhereInput[]
  }

  export type RolePermissionCreateNestedManyWithoutPermissionInput = {
    create?: XOR<RolePermissionCreateWithoutPermissionInput, RolePermissionUncheckedCreateWithoutPermissionInput> | RolePermissionCreateWithoutPermissionInput[] | RolePermissionUncheckedCreateWithoutPermissionInput[]
    connectOrCreate?: RolePermissionCreateOrConnectWithoutPermissionInput | RolePermissionCreateOrConnectWithoutPermissionInput[]
    createMany?: RolePermissionCreateManyPermissionInputEnvelope
    connect?: RolePermissionWhereUniqueInput | RolePermissionWhereUniqueInput[]
  }

  export type RolePermissionUncheckedCreateNestedManyWithoutPermissionInput = {
    create?: XOR<RolePermissionCreateWithoutPermissionInput, RolePermissionUncheckedCreateWithoutPermissionInput> | RolePermissionCreateWithoutPermissionInput[] | RolePermissionUncheckedCreateWithoutPermissionInput[]
    connectOrCreate?: RolePermissionCreateOrConnectWithoutPermissionInput | RolePermissionCreateOrConnectWithoutPermissionInput[]
    createMany?: RolePermissionCreateManyPermissionInputEnvelope
    connect?: RolePermissionWhereUniqueInput | RolePermissionWhereUniqueInput[]
  }

  export type RolePermissionUpdateManyWithoutPermissionNestedInput = {
    create?: XOR<RolePermissionCreateWithoutPermissionInput, RolePermissionUncheckedCreateWithoutPermissionInput> | RolePermissionCreateWithoutPermissionInput[] | RolePermissionUncheckedCreateWithoutPermissionInput[]
    connectOrCreate?: RolePermissionCreateOrConnectWithoutPermissionInput | RolePermissionCreateOrConnectWithoutPermissionInput[]
    upsert?: RolePermissionUpsertWithWhereUniqueWithoutPermissionInput | RolePermissionUpsertWithWhereUniqueWithoutPermissionInput[]
    createMany?: RolePermissionCreateManyPermissionInputEnvelope
    set?: RolePermissionWhereUniqueInput | RolePermissionWhereUniqueInput[]
    disconnect?: RolePermissionWhereUniqueInput | RolePermissionWhereUniqueInput[]
    delete?: RolePermissionWhereUniqueInput | RolePermissionWhereUniqueInput[]
    connect?: RolePermissionWhereUniqueInput | RolePermissionWhereUniqueInput[]
    update?: RolePermissionUpdateWithWhereUniqueWithoutPermissionInput | RolePermissionUpdateWithWhereUniqueWithoutPermissionInput[]
    updateMany?: RolePermissionUpdateManyWithWhereWithoutPermissionInput | RolePermissionUpdateManyWithWhereWithoutPermissionInput[]
    deleteMany?: RolePermissionScalarWhereInput | RolePermissionScalarWhereInput[]
  }

  export type RolePermissionUncheckedUpdateManyWithoutPermissionNestedInput = {
    create?: XOR<RolePermissionCreateWithoutPermissionInput, RolePermissionUncheckedCreateWithoutPermissionInput> | RolePermissionCreateWithoutPermissionInput[] | RolePermissionUncheckedCreateWithoutPermissionInput[]
    connectOrCreate?: RolePermissionCreateOrConnectWithoutPermissionInput | RolePermissionCreateOrConnectWithoutPermissionInput[]
    upsert?: RolePermissionUpsertWithWhereUniqueWithoutPermissionInput | RolePermissionUpsertWithWhereUniqueWithoutPermissionInput[]
    createMany?: RolePermissionCreateManyPermissionInputEnvelope
    set?: RolePermissionWhereUniqueInput | RolePermissionWhereUniqueInput[]
    disconnect?: RolePermissionWhereUniqueInput | RolePermissionWhereUniqueInput[]
    delete?: RolePermissionWhereUniqueInput | RolePermissionWhereUniqueInput[]
    connect?: RolePermissionWhereUniqueInput | RolePermissionWhereUniqueInput[]
    update?: RolePermissionUpdateWithWhereUniqueWithoutPermissionInput | RolePermissionUpdateWithWhereUniqueWithoutPermissionInput[]
    updateMany?: RolePermissionUpdateManyWithWhereWithoutPermissionInput | RolePermissionUpdateManyWithWhereWithoutPermissionInput[]
    deleteMany?: RolePermissionScalarWhereInput | RolePermissionScalarWhereInput[]
  }

  export type RoleCreateNestedOneWithoutPermissionsInput = {
    create?: XOR<RoleCreateWithoutPermissionsInput, RoleUncheckedCreateWithoutPermissionsInput>
    connectOrCreate?: RoleCreateOrConnectWithoutPermissionsInput
    connect?: RoleWhereUniqueInput
  }

  export type PermissionCreateNestedOneWithoutRolesInput = {
    create?: XOR<PermissionCreateWithoutRolesInput, PermissionUncheckedCreateWithoutRolesInput>
    connectOrCreate?: PermissionCreateOrConnectWithoutRolesInput
    connect?: PermissionWhereUniqueInput
  }

  export type RoleUpdateOneRequiredWithoutPermissionsNestedInput = {
    create?: XOR<RoleCreateWithoutPermissionsInput, RoleUncheckedCreateWithoutPermissionsInput>
    connectOrCreate?: RoleCreateOrConnectWithoutPermissionsInput
    upsert?: RoleUpsertWithoutPermissionsInput
    connect?: RoleWhereUniqueInput
    update?: XOR<XOR<RoleUpdateToOneWithWhereWithoutPermissionsInput, RoleUpdateWithoutPermissionsInput>, RoleUncheckedUpdateWithoutPermissionsInput>
  }

  export type PermissionUpdateOneRequiredWithoutRolesNestedInput = {
    create?: XOR<PermissionCreateWithoutRolesInput, PermissionUncheckedCreateWithoutRolesInput>
    connectOrCreate?: PermissionCreateOrConnectWithoutRolesInput
    upsert?: PermissionUpsertWithoutRolesInput
    connect?: PermissionWhereUniqueInput
    update?: XOR<XOR<PermissionUpdateToOneWithWhereWithoutRolesInput, PermissionUpdateWithoutRolesInput>, PermissionUncheckedUpdateWithoutRolesInput>
  }

  export type OrgUserCreateNestedOneWithoutRolesInput = {
    create?: XOR<OrgUserCreateWithoutRolesInput, OrgUserUncheckedCreateWithoutRolesInput>
    connectOrCreate?: OrgUserCreateOrConnectWithoutRolesInput
    connect?: OrgUserWhereUniqueInput
  }

  export type RoleCreateNestedOneWithoutUsersInput = {
    create?: XOR<RoleCreateWithoutUsersInput, RoleUncheckedCreateWithoutUsersInput>
    connectOrCreate?: RoleCreateOrConnectWithoutUsersInput
    connect?: RoleWhereUniqueInput
  }

  export type OrgUserUpdateOneRequiredWithoutRolesNestedInput = {
    create?: XOR<OrgUserCreateWithoutRolesInput, OrgUserUncheckedCreateWithoutRolesInput>
    connectOrCreate?: OrgUserCreateOrConnectWithoutRolesInput
    upsert?: OrgUserUpsertWithoutRolesInput
    connect?: OrgUserWhereUniqueInput
    update?: XOR<XOR<OrgUserUpdateToOneWithWhereWithoutRolesInput, OrgUserUpdateWithoutRolesInput>, OrgUserUncheckedUpdateWithoutRolesInput>
  }

  export type RoleUpdateOneRequiredWithoutUsersNestedInput = {
    create?: XOR<RoleCreateWithoutUsersInput, RoleUncheckedCreateWithoutUsersInput>
    connectOrCreate?: RoleCreateOrConnectWithoutUsersInput
    upsert?: RoleUpsertWithoutUsersInput
    connect?: RoleWhereUniqueInput
    update?: XOR<XOR<RoleUpdateToOneWithWhereWithoutUsersInput, RoleUpdateWithoutUsersInput>, RoleUncheckedUpdateWithoutUsersInput>
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type GlobalUserCreateNestedOneWithoutAuditLogsInput = {
    create?: XOR<GlobalUserCreateWithoutAuditLogsInput, GlobalUserUncheckedCreateWithoutAuditLogsInput>
    connectOrCreate?: GlobalUserCreateOrConnectWithoutAuditLogsInput
    connect?: GlobalUserWhereUniqueInput
  }

  export type OrgUserCreateNestedOneWithoutAuditLogsInput = {
    create?: XOR<OrgUserCreateWithoutAuditLogsInput, OrgUserUncheckedCreateWithoutAuditLogsInput>
    connectOrCreate?: OrgUserCreateOrConnectWithoutAuditLogsInput
    connect?: OrgUserWhereUniqueInput
  }

  export type EnumAuditActionFieldUpdateOperationsInput = {
    set?: $Enums.AuditAction
  }

  export type EnumAuditEntityTypeFieldUpdateOperationsInput = {
    set?: $Enums.AuditEntityType
  }

  export type GlobalUserUpdateOneWithoutAuditLogsNestedInput = {
    create?: XOR<GlobalUserCreateWithoutAuditLogsInput, GlobalUserUncheckedCreateWithoutAuditLogsInput>
    connectOrCreate?: GlobalUserCreateOrConnectWithoutAuditLogsInput
    upsert?: GlobalUserUpsertWithoutAuditLogsInput
    disconnect?: GlobalUserWhereInput | boolean
    delete?: GlobalUserWhereInput | boolean
    connect?: GlobalUserWhereUniqueInput
    update?: XOR<XOR<GlobalUserUpdateToOneWithWhereWithoutAuditLogsInput, GlobalUserUpdateWithoutAuditLogsInput>, GlobalUserUncheckedUpdateWithoutAuditLogsInput>
  }

  export type OrgUserUpdateOneWithoutAuditLogsNestedInput = {
    create?: XOR<OrgUserCreateWithoutAuditLogsInput, OrgUserUncheckedCreateWithoutAuditLogsInput>
    connectOrCreate?: OrgUserCreateOrConnectWithoutAuditLogsInput
    upsert?: OrgUserUpsertWithoutAuditLogsInput
    disconnect?: OrgUserWhereInput | boolean
    delete?: OrgUserWhereInput | boolean
    connect?: OrgUserWhereUniqueInput
    update?: XOR<XOR<OrgUserUpdateToOneWithWhereWithoutAuditLogsInput, OrgUserUpdateWithoutAuditLogsInput>, OrgUserUncheckedUpdateWithoutAuditLogsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumAuditActionFilter<$PrismaModel = never> = {
    equals?: $Enums.AuditAction | EnumAuditActionFieldRefInput<$PrismaModel>
    in?: $Enums.AuditAction[] | ListEnumAuditActionFieldRefInput<$PrismaModel>
    notIn?: $Enums.AuditAction[] | ListEnumAuditActionFieldRefInput<$PrismaModel>
    not?: NestedEnumAuditActionFilter<$PrismaModel> | $Enums.AuditAction
  }

  export type NestedEnumAuditEntityTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.AuditEntityType | EnumAuditEntityTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AuditEntityType[] | ListEnumAuditEntityTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AuditEntityType[] | ListEnumAuditEntityTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAuditEntityTypeFilter<$PrismaModel> | $Enums.AuditEntityType
  }

  export type NestedEnumAuditActionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AuditAction | EnumAuditActionFieldRefInput<$PrismaModel>
    in?: $Enums.AuditAction[] | ListEnumAuditActionFieldRefInput<$PrismaModel>
    notIn?: $Enums.AuditAction[] | ListEnumAuditActionFieldRefInput<$PrismaModel>
    not?: NestedEnumAuditActionWithAggregatesFilter<$PrismaModel> | $Enums.AuditAction
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAuditActionFilter<$PrismaModel>
    _max?: NestedEnumAuditActionFilter<$PrismaModel>
  }

  export type NestedEnumAuditEntityTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AuditEntityType | EnumAuditEntityTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AuditEntityType[] | ListEnumAuditEntityTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AuditEntityType[] | ListEnumAuditEntityTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAuditEntityTypeWithAggregatesFilter<$PrismaModel> | $Enums.AuditEntityType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAuditEntityTypeFilter<$PrismaModel>
    _max?: NestedEnumAuditEntityTypeFilter<$PrismaModel>
  }

  export type OrganisationCreateWithoutOwnerInput = {
    id?: string
    name: string
    slug: string
    branding?: NullableJsonNullValueInput | InputJsonValue
    features?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    admins?: OrganisationAdminCreateNestedManyWithoutOrganisationInput
  }

  export type OrganisationUncheckedCreateWithoutOwnerInput = {
    id?: string
    name: string
    slug: string
    branding?: NullableJsonNullValueInput | InputJsonValue
    features?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    admins?: OrganisationAdminUncheckedCreateNestedManyWithoutOrganisationInput
  }

  export type OrganisationCreateOrConnectWithoutOwnerInput = {
    where: OrganisationWhereUniqueInput
    create: XOR<OrganisationCreateWithoutOwnerInput, OrganisationUncheckedCreateWithoutOwnerInput>
  }

  export type OrganisationCreateManyOwnerInputEnvelope = {
    data: OrganisationCreateManyOwnerInput | OrganisationCreateManyOwnerInput[]
    skipDuplicates?: boolean
  }

  export type OrganisationAdminCreateWithoutGlobalUserInput = {
    id?: string
    role?: string
    createdAt?: Date | string
    organisation: OrganisationCreateNestedOneWithoutAdminsInput
  }

  export type OrganisationAdminUncheckedCreateWithoutGlobalUserInput = {
    id?: string
    organisationId: string
    role?: string
    createdAt?: Date | string
  }

  export type OrganisationAdminCreateOrConnectWithoutGlobalUserInput = {
    where: OrganisationAdminWhereUniqueInput
    create: XOR<OrganisationAdminCreateWithoutGlobalUserInput, OrganisationAdminUncheckedCreateWithoutGlobalUserInput>
  }

  export type OrganisationAdminCreateManyGlobalUserInputEnvelope = {
    data: OrganisationAdminCreateManyGlobalUserInput | OrganisationAdminCreateManyGlobalUserInput[]
    skipDuplicates?: boolean
  }

  export type AuditLogCreateWithoutUserInput = {
    id?: string
    tenantId: string
    action: $Enums.AuditAction
    entityType: $Enums.AuditEntityType
    entityId: string
    details?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
    orgUser?: OrgUserCreateNestedOneWithoutAuditLogsInput
  }

  export type AuditLogUncheckedCreateWithoutUserInput = {
    id?: string
    tenantId: string
    action: $Enums.AuditAction
    entityType: $Enums.AuditEntityType
    entityId: string
    orgUserId?: string | null
    details?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
  }

  export type AuditLogCreateOrConnectWithoutUserInput = {
    where: AuditLogWhereUniqueInput
    create: XOR<AuditLogCreateWithoutUserInput, AuditLogUncheckedCreateWithoutUserInput>
  }

  export type AuditLogCreateManyUserInputEnvelope = {
    data: AuditLogCreateManyUserInput | AuditLogCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type OrganisationUpsertWithWhereUniqueWithoutOwnerInput = {
    where: OrganisationWhereUniqueInput
    update: XOR<OrganisationUpdateWithoutOwnerInput, OrganisationUncheckedUpdateWithoutOwnerInput>
    create: XOR<OrganisationCreateWithoutOwnerInput, OrganisationUncheckedCreateWithoutOwnerInput>
  }

  export type OrganisationUpdateWithWhereUniqueWithoutOwnerInput = {
    where: OrganisationWhereUniqueInput
    data: XOR<OrganisationUpdateWithoutOwnerInput, OrganisationUncheckedUpdateWithoutOwnerInput>
  }

  export type OrganisationUpdateManyWithWhereWithoutOwnerInput = {
    where: OrganisationScalarWhereInput
    data: XOR<OrganisationUpdateManyMutationInput, OrganisationUncheckedUpdateManyWithoutOwnerInput>
  }

  export type OrganisationScalarWhereInput = {
    AND?: OrganisationScalarWhereInput | OrganisationScalarWhereInput[]
    OR?: OrganisationScalarWhereInput[]
    NOT?: OrganisationScalarWhereInput | OrganisationScalarWhereInput[]
    id?: StringFilter<"Organisation"> | string
    name?: StringFilter<"Organisation"> | string
    slug?: StringFilter<"Organisation"> | string
    branding?: JsonNullableFilter<"Organisation">
    features?: JsonNullableFilter<"Organisation">
    ownerId?: StringFilter<"Organisation"> | string
    createdAt?: DateTimeFilter<"Organisation"> | Date | string
    updatedAt?: DateTimeFilter<"Organisation"> | Date | string
  }

  export type OrganisationAdminUpsertWithWhereUniqueWithoutGlobalUserInput = {
    where: OrganisationAdminWhereUniqueInput
    update: XOR<OrganisationAdminUpdateWithoutGlobalUserInput, OrganisationAdminUncheckedUpdateWithoutGlobalUserInput>
    create: XOR<OrganisationAdminCreateWithoutGlobalUserInput, OrganisationAdminUncheckedCreateWithoutGlobalUserInput>
  }

  export type OrganisationAdminUpdateWithWhereUniqueWithoutGlobalUserInput = {
    where: OrganisationAdminWhereUniqueInput
    data: XOR<OrganisationAdminUpdateWithoutGlobalUserInput, OrganisationAdminUncheckedUpdateWithoutGlobalUserInput>
  }

  export type OrganisationAdminUpdateManyWithWhereWithoutGlobalUserInput = {
    where: OrganisationAdminScalarWhereInput
    data: XOR<OrganisationAdminUpdateManyMutationInput, OrganisationAdminUncheckedUpdateManyWithoutGlobalUserInput>
  }

  export type OrganisationAdminScalarWhereInput = {
    AND?: OrganisationAdminScalarWhereInput | OrganisationAdminScalarWhereInput[]
    OR?: OrganisationAdminScalarWhereInput[]
    NOT?: OrganisationAdminScalarWhereInput | OrganisationAdminScalarWhereInput[]
    id?: StringFilter<"OrganisationAdmin"> | string
    organisationId?: StringFilter<"OrganisationAdmin"> | string
    globalUserId?: StringFilter<"OrganisationAdmin"> | string
    role?: StringFilter<"OrganisationAdmin"> | string
    createdAt?: DateTimeFilter<"OrganisationAdmin"> | Date | string
  }

  export type AuditLogUpsertWithWhereUniqueWithoutUserInput = {
    where: AuditLogWhereUniqueInput
    update: XOR<AuditLogUpdateWithoutUserInput, AuditLogUncheckedUpdateWithoutUserInput>
    create: XOR<AuditLogCreateWithoutUserInput, AuditLogUncheckedCreateWithoutUserInput>
  }

  export type AuditLogUpdateWithWhereUniqueWithoutUserInput = {
    where: AuditLogWhereUniqueInput
    data: XOR<AuditLogUpdateWithoutUserInput, AuditLogUncheckedUpdateWithoutUserInput>
  }

  export type AuditLogUpdateManyWithWhereWithoutUserInput = {
    where: AuditLogScalarWhereInput
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyWithoutUserInput>
  }

  export type AuditLogScalarWhereInput = {
    AND?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
    OR?: AuditLogScalarWhereInput[]
    NOT?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
    id?: StringFilter<"AuditLog"> | string
    tenantId?: StringFilter<"AuditLog"> | string
    action?: EnumAuditActionFilter<"AuditLog"> | $Enums.AuditAction
    entityType?: EnumAuditEntityTypeFilter<"AuditLog"> | $Enums.AuditEntityType
    entityId?: StringFilter<"AuditLog"> | string
    userId?: StringNullableFilter<"AuditLog"> | string | null
    orgUserId?: StringNullableFilter<"AuditLog"> | string | null
    details?: StringNullableFilter<"AuditLog"> | string | null
    ipAddress?: StringNullableFilter<"AuditLog"> | string | null
    userAgent?: StringNullableFilter<"AuditLog"> | string | null
    createdAt?: DateTimeFilter<"AuditLog"> | Date | string
  }

  export type GlobalUserCreateWithoutOrganisationsInput = {
    id?: string
    email: string
    passwordHash: string
    totpSecret?: string | null
    isTotpEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    organisationAdmins?: OrganisationAdminCreateNestedManyWithoutGlobalUserInput
    auditLogs?: AuditLogCreateNestedManyWithoutUserInput
  }

  export type GlobalUserUncheckedCreateWithoutOrganisationsInput = {
    id?: string
    email: string
    passwordHash: string
    totpSecret?: string | null
    isTotpEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    organisationAdmins?: OrganisationAdminUncheckedCreateNestedManyWithoutGlobalUserInput
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type GlobalUserCreateOrConnectWithoutOrganisationsInput = {
    where: GlobalUserWhereUniqueInput
    create: XOR<GlobalUserCreateWithoutOrganisationsInput, GlobalUserUncheckedCreateWithoutOrganisationsInput>
  }

  export type OrganisationAdminCreateWithoutOrganisationInput = {
    id?: string
    role?: string
    createdAt?: Date | string
    globalUser: GlobalUserCreateNestedOneWithoutOrganisationAdminsInput
  }

  export type OrganisationAdminUncheckedCreateWithoutOrganisationInput = {
    id?: string
    globalUserId: string
    role?: string
    createdAt?: Date | string
  }

  export type OrganisationAdminCreateOrConnectWithoutOrganisationInput = {
    where: OrganisationAdminWhereUniqueInput
    create: XOR<OrganisationAdminCreateWithoutOrganisationInput, OrganisationAdminUncheckedCreateWithoutOrganisationInput>
  }

  export type OrganisationAdminCreateManyOrganisationInputEnvelope = {
    data: OrganisationAdminCreateManyOrganisationInput | OrganisationAdminCreateManyOrganisationInput[]
    skipDuplicates?: boolean
  }

  export type GlobalUserUpsertWithoutOrganisationsInput = {
    update: XOR<GlobalUserUpdateWithoutOrganisationsInput, GlobalUserUncheckedUpdateWithoutOrganisationsInput>
    create: XOR<GlobalUserCreateWithoutOrganisationsInput, GlobalUserUncheckedCreateWithoutOrganisationsInput>
    where?: GlobalUserWhereInput
  }

  export type GlobalUserUpdateToOneWithWhereWithoutOrganisationsInput = {
    where?: GlobalUserWhereInput
    data: XOR<GlobalUserUpdateWithoutOrganisationsInput, GlobalUserUncheckedUpdateWithoutOrganisationsInput>
  }

  export type GlobalUserUpdateWithoutOrganisationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    totpSecret?: NullableStringFieldUpdateOperationsInput | string | null
    isTotpEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organisationAdmins?: OrganisationAdminUpdateManyWithoutGlobalUserNestedInput
    auditLogs?: AuditLogUpdateManyWithoutUserNestedInput
  }

  export type GlobalUserUncheckedUpdateWithoutOrganisationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    totpSecret?: NullableStringFieldUpdateOperationsInput | string | null
    isTotpEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organisationAdmins?: OrganisationAdminUncheckedUpdateManyWithoutGlobalUserNestedInput
    auditLogs?: AuditLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type OrganisationAdminUpsertWithWhereUniqueWithoutOrganisationInput = {
    where: OrganisationAdminWhereUniqueInput
    update: XOR<OrganisationAdminUpdateWithoutOrganisationInput, OrganisationAdminUncheckedUpdateWithoutOrganisationInput>
    create: XOR<OrganisationAdminCreateWithoutOrganisationInput, OrganisationAdminUncheckedCreateWithoutOrganisationInput>
  }

  export type OrganisationAdminUpdateWithWhereUniqueWithoutOrganisationInput = {
    where: OrganisationAdminWhereUniqueInput
    data: XOR<OrganisationAdminUpdateWithoutOrganisationInput, OrganisationAdminUncheckedUpdateWithoutOrganisationInput>
  }

  export type OrganisationAdminUpdateManyWithWhereWithoutOrganisationInput = {
    where: OrganisationAdminScalarWhereInput
    data: XOR<OrganisationAdminUpdateManyMutationInput, OrganisationAdminUncheckedUpdateManyWithoutOrganisationInput>
  }

  export type OrganisationCreateWithoutAdminsInput = {
    id?: string
    name: string
    slug: string
    branding?: NullableJsonNullValueInput | InputJsonValue
    features?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    owner: GlobalUserCreateNestedOneWithoutOrganisationsInput
  }

  export type OrganisationUncheckedCreateWithoutAdminsInput = {
    id?: string
    name: string
    slug: string
    branding?: NullableJsonNullValueInput | InputJsonValue
    features?: NullableJsonNullValueInput | InputJsonValue
    ownerId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrganisationCreateOrConnectWithoutAdminsInput = {
    where: OrganisationWhereUniqueInput
    create: XOR<OrganisationCreateWithoutAdminsInput, OrganisationUncheckedCreateWithoutAdminsInput>
  }

  export type GlobalUserCreateWithoutOrganisationAdminsInput = {
    id?: string
    email: string
    passwordHash: string
    totpSecret?: string | null
    isTotpEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    organisations?: OrganisationCreateNestedManyWithoutOwnerInput
    auditLogs?: AuditLogCreateNestedManyWithoutUserInput
  }

  export type GlobalUserUncheckedCreateWithoutOrganisationAdminsInput = {
    id?: string
    email: string
    passwordHash: string
    totpSecret?: string | null
    isTotpEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    organisations?: OrganisationUncheckedCreateNestedManyWithoutOwnerInput
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type GlobalUserCreateOrConnectWithoutOrganisationAdminsInput = {
    where: GlobalUserWhereUniqueInput
    create: XOR<GlobalUserCreateWithoutOrganisationAdminsInput, GlobalUserUncheckedCreateWithoutOrganisationAdminsInput>
  }

  export type OrganisationUpsertWithoutAdminsInput = {
    update: XOR<OrganisationUpdateWithoutAdminsInput, OrganisationUncheckedUpdateWithoutAdminsInput>
    create: XOR<OrganisationCreateWithoutAdminsInput, OrganisationUncheckedCreateWithoutAdminsInput>
    where?: OrganisationWhereInput
  }

  export type OrganisationUpdateToOneWithWhereWithoutAdminsInput = {
    where?: OrganisationWhereInput
    data: XOR<OrganisationUpdateWithoutAdminsInput, OrganisationUncheckedUpdateWithoutAdminsInput>
  }

  export type OrganisationUpdateWithoutAdminsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    branding?: NullableJsonNullValueInput | InputJsonValue
    features?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    owner?: GlobalUserUpdateOneRequiredWithoutOrganisationsNestedInput
  }

  export type OrganisationUncheckedUpdateWithoutAdminsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    branding?: NullableJsonNullValueInput | InputJsonValue
    features?: NullableJsonNullValueInput | InputJsonValue
    ownerId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GlobalUserUpsertWithoutOrganisationAdminsInput = {
    update: XOR<GlobalUserUpdateWithoutOrganisationAdminsInput, GlobalUserUncheckedUpdateWithoutOrganisationAdminsInput>
    create: XOR<GlobalUserCreateWithoutOrganisationAdminsInput, GlobalUserUncheckedCreateWithoutOrganisationAdminsInput>
    where?: GlobalUserWhereInput
  }

  export type GlobalUserUpdateToOneWithWhereWithoutOrganisationAdminsInput = {
    where?: GlobalUserWhereInput
    data: XOR<GlobalUserUpdateWithoutOrganisationAdminsInput, GlobalUserUncheckedUpdateWithoutOrganisationAdminsInput>
  }

  export type GlobalUserUpdateWithoutOrganisationAdminsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    totpSecret?: NullableStringFieldUpdateOperationsInput | string | null
    isTotpEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organisations?: OrganisationUpdateManyWithoutOwnerNestedInput
    auditLogs?: AuditLogUpdateManyWithoutUserNestedInput
  }

  export type GlobalUserUncheckedUpdateWithoutOrganisationAdminsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    totpSecret?: NullableStringFieldUpdateOperationsInput | string | null
    isTotpEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organisations?: OrganisationUncheckedUpdateManyWithoutOwnerNestedInput
    auditLogs?: AuditLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type OrgUserRoleCreateWithoutOrgUserInput = {
    id?: string
    tenantId: string
    createdAt?: Date | string
    role: RoleCreateNestedOneWithoutUsersInput
  }

  export type OrgUserRoleUncheckedCreateWithoutOrgUserInput = {
    id?: string
    tenantId: string
    roleId: string
    createdAt?: Date | string
  }

  export type OrgUserRoleCreateOrConnectWithoutOrgUserInput = {
    where: OrgUserRoleWhereUniqueInput
    create: XOR<OrgUserRoleCreateWithoutOrgUserInput, OrgUserRoleUncheckedCreateWithoutOrgUserInput>
  }

  export type OrgUserRoleCreateManyOrgUserInputEnvelope = {
    data: OrgUserRoleCreateManyOrgUserInput | OrgUserRoleCreateManyOrgUserInput[]
    skipDuplicates?: boolean
  }

  export type AuditLogCreateWithoutOrgUserInput = {
    id?: string
    tenantId: string
    action: $Enums.AuditAction
    entityType: $Enums.AuditEntityType
    entityId: string
    details?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
    user?: GlobalUserCreateNestedOneWithoutAuditLogsInput
  }

  export type AuditLogUncheckedCreateWithoutOrgUserInput = {
    id?: string
    tenantId: string
    action: $Enums.AuditAction
    entityType: $Enums.AuditEntityType
    entityId: string
    userId?: string | null
    details?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
  }

  export type AuditLogCreateOrConnectWithoutOrgUserInput = {
    where: AuditLogWhereUniqueInput
    create: XOR<AuditLogCreateWithoutOrgUserInput, AuditLogUncheckedCreateWithoutOrgUserInput>
  }

  export type AuditLogCreateManyOrgUserInputEnvelope = {
    data: AuditLogCreateManyOrgUserInput | AuditLogCreateManyOrgUserInput[]
    skipDuplicates?: boolean
  }

  export type OrgUserRoleUpsertWithWhereUniqueWithoutOrgUserInput = {
    where: OrgUserRoleWhereUniqueInput
    update: XOR<OrgUserRoleUpdateWithoutOrgUserInput, OrgUserRoleUncheckedUpdateWithoutOrgUserInput>
    create: XOR<OrgUserRoleCreateWithoutOrgUserInput, OrgUserRoleUncheckedCreateWithoutOrgUserInput>
  }

  export type OrgUserRoleUpdateWithWhereUniqueWithoutOrgUserInput = {
    where: OrgUserRoleWhereUniqueInput
    data: XOR<OrgUserRoleUpdateWithoutOrgUserInput, OrgUserRoleUncheckedUpdateWithoutOrgUserInput>
  }

  export type OrgUserRoleUpdateManyWithWhereWithoutOrgUserInput = {
    where: OrgUserRoleScalarWhereInput
    data: XOR<OrgUserRoleUpdateManyMutationInput, OrgUserRoleUncheckedUpdateManyWithoutOrgUserInput>
  }

  export type OrgUserRoleScalarWhereInput = {
    AND?: OrgUserRoleScalarWhereInput | OrgUserRoleScalarWhereInput[]
    OR?: OrgUserRoleScalarWhereInput[]
    NOT?: OrgUserRoleScalarWhereInput | OrgUserRoleScalarWhereInput[]
    id?: StringFilter<"OrgUserRole"> | string
    tenantId?: StringFilter<"OrgUserRole"> | string
    orgUserId?: StringFilter<"OrgUserRole"> | string
    roleId?: StringFilter<"OrgUserRole"> | string
    createdAt?: DateTimeFilter<"OrgUserRole"> | Date | string
  }

  export type AuditLogUpsertWithWhereUniqueWithoutOrgUserInput = {
    where: AuditLogWhereUniqueInput
    update: XOR<AuditLogUpdateWithoutOrgUserInput, AuditLogUncheckedUpdateWithoutOrgUserInput>
    create: XOR<AuditLogCreateWithoutOrgUserInput, AuditLogUncheckedCreateWithoutOrgUserInput>
  }

  export type AuditLogUpdateWithWhereUniqueWithoutOrgUserInput = {
    where: AuditLogWhereUniqueInput
    data: XOR<AuditLogUpdateWithoutOrgUserInput, AuditLogUncheckedUpdateWithoutOrgUserInput>
  }

  export type AuditLogUpdateManyWithWhereWithoutOrgUserInput = {
    where: AuditLogScalarWhereInput
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyWithoutOrgUserInput>
  }

  export type RolePermissionCreateWithoutRoleInput = {
    id?: string
    tenantId: string
    createdAt?: Date | string
    permission: PermissionCreateNestedOneWithoutRolesInput
  }

  export type RolePermissionUncheckedCreateWithoutRoleInput = {
    id?: string
    tenantId: string
    permissionId: string
    createdAt?: Date | string
  }

  export type RolePermissionCreateOrConnectWithoutRoleInput = {
    where: RolePermissionWhereUniqueInput
    create: XOR<RolePermissionCreateWithoutRoleInput, RolePermissionUncheckedCreateWithoutRoleInput>
  }

  export type RolePermissionCreateManyRoleInputEnvelope = {
    data: RolePermissionCreateManyRoleInput | RolePermissionCreateManyRoleInput[]
    skipDuplicates?: boolean
  }

  export type OrgUserRoleCreateWithoutRoleInput = {
    id?: string
    tenantId: string
    createdAt?: Date | string
    orgUser: OrgUserCreateNestedOneWithoutRolesInput
  }

  export type OrgUserRoleUncheckedCreateWithoutRoleInput = {
    id?: string
    tenantId: string
    orgUserId: string
    createdAt?: Date | string
  }

  export type OrgUserRoleCreateOrConnectWithoutRoleInput = {
    where: OrgUserRoleWhereUniqueInput
    create: XOR<OrgUserRoleCreateWithoutRoleInput, OrgUserRoleUncheckedCreateWithoutRoleInput>
  }

  export type OrgUserRoleCreateManyRoleInputEnvelope = {
    data: OrgUserRoleCreateManyRoleInput | OrgUserRoleCreateManyRoleInput[]
    skipDuplicates?: boolean
  }

  export type RolePermissionUpsertWithWhereUniqueWithoutRoleInput = {
    where: RolePermissionWhereUniqueInput
    update: XOR<RolePermissionUpdateWithoutRoleInput, RolePermissionUncheckedUpdateWithoutRoleInput>
    create: XOR<RolePermissionCreateWithoutRoleInput, RolePermissionUncheckedCreateWithoutRoleInput>
  }

  export type RolePermissionUpdateWithWhereUniqueWithoutRoleInput = {
    where: RolePermissionWhereUniqueInput
    data: XOR<RolePermissionUpdateWithoutRoleInput, RolePermissionUncheckedUpdateWithoutRoleInput>
  }

  export type RolePermissionUpdateManyWithWhereWithoutRoleInput = {
    where: RolePermissionScalarWhereInput
    data: XOR<RolePermissionUpdateManyMutationInput, RolePermissionUncheckedUpdateManyWithoutRoleInput>
  }

  export type RolePermissionScalarWhereInput = {
    AND?: RolePermissionScalarWhereInput | RolePermissionScalarWhereInput[]
    OR?: RolePermissionScalarWhereInput[]
    NOT?: RolePermissionScalarWhereInput | RolePermissionScalarWhereInput[]
    id?: StringFilter<"RolePermission"> | string
    tenantId?: StringFilter<"RolePermission"> | string
    roleId?: StringFilter<"RolePermission"> | string
    permissionId?: StringFilter<"RolePermission"> | string
    createdAt?: DateTimeFilter<"RolePermission"> | Date | string
  }

  export type OrgUserRoleUpsertWithWhereUniqueWithoutRoleInput = {
    where: OrgUserRoleWhereUniqueInput
    update: XOR<OrgUserRoleUpdateWithoutRoleInput, OrgUserRoleUncheckedUpdateWithoutRoleInput>
    create: XOR<OrgUserRoleCreateWithoutRoleInput, OrgUserRoleUncheckedCreateWithoutRoleInput>
  }

  export type OrgUserRoleUpdateWithWhereUniqueWithoutRoleInput = {
    where: OrgUserRoleWhereUniqueInput
    data: XOR<OrgUserRoleUpdateWithoutRoleInput, OrgUserRoleUncheckedUpdateWithoutRoleInput>
  }

  export type OrgUserRoleUpdateManyWithWhereWithoutRoleInput = {
    where: OrgUserRoleScalarWhereInput
    data: XOR<OrgUserRoleUpdateManyMutationInput, OrgUserRoleUncheckedUpdateManyWithoutRoleInput>
  }

  export type RolePermissionCreateWithoutPermissionInput = {
    id?: string
    tenantId: string
    createdAt?: Date | string
    role: RoleCreateNestedOneWithoutPermissionsInput
  }

  export type RolePermissionUncheckedCreateWithoutPermissionInput = {
    id?: string
    tenantId: string
    roleId: string
    createdAt?: Date | string
  }

  export type RolePermissionCreateOrConnectWithoutPermissionInput = {
    where: RolePermissionWhereUniqueInput
    create: XOR<RolePermissionCreateWithoutPermissionInput, RolePermissionUncheckedCreateWithoutPermissionInput>
  }

  export type RolePermissionCreateManyPermissionInputEnvelope = {
    data: RolePermissionCreateManyPermissionInput | RolePermissionCreateManyPermissionInput[]
    skipDuplicates?: boolean
  }

  export type RolePermissionUpsertWithWhereUniqueWithoutPermissionInput = {
    where: RolePermissionWhereUniqueInput
    update: XOR<RolePermissionUpdateWithoutPermissionInput, RolePermissionUncheckedUpdateWithoutPermissionInput>
    create: XOR<RolePermissionCreateWithoutPermissionInput, RolePermissionUncheckedCreateWithoutPermissionInput>
  }

  export type RolePermissionUpdateWithWhereUniqueWithoutPermissionInput = {
    where: RolePermissionWhereUniqueInput
    data: XOR<RolePermissionUpdateWithoutPermissionInput, RolePermissionUncheckedUpdateWithoutPermissionInput>
  }

  export type RolePermissionUpdateManyWithWhereWithoutPermissionInput = {
    where: RolePermissionScalarWhereInput
    data: XOR<RolePermissionUpdateManyMutationInput, RolePermissionUncheckedUpdateManyWithoutPermissionInput>
  }

  export type RoleCreateWithoutPermissionsInput = {
    id?: string
    tenantId: string
    name: string
    desc?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: OrgUserRoleCreateNestedManyWithoutRoleInput
  }

  export type RoleUncheckedCreateWithoutPermissionsInput = {
    id?: string
    tenantId: string
    name: string
    desc?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: OrgUserRoleUncheckedCreateNestedManyWithoutRoleInput
  }

  export type RoleCreateOrConnectWithoutPermissionsInput = {
    where: RoleWhereUniqueInput
    create: XOR<RoleCreateWithoutPermissionsInput, RoleUncheckedCreateWithoutPermissionsInput>
  }

  export type PermissionCreateWithoutRolesInput = {
    id?: string
    tenantId: string
    key: string
    group?: string | null
    desc?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PermissionUncheckedCreateWithoutRolesInput = {
    id?: string
    tenantId: string
    key: string
    group?: string | null
    desc?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PermissionCreateOrConnectWithoutRolesInput = {
    where: PermissionWhereUniqueInput
    create: XOR<PermissionCreateWithoutRolesInput, PermissionUncheckedCreateWithoutRolesInput>
  }

  export type RoleUpsertWithoutPermissionsInput = {
    update: XOR<RoleUpdateWithoutPermissionsInput, RoleUncheckedUpdateWithoutPermissionsInput>
    create: XOR<RoleCreateWithoutPermissionsInput, RoleUncheckedCreateWithoutPermissionsInput>
    where?: RoleWhereInput
  }

  export type RoleUpdateToOneWithWhereWithoutPermissionsInput = {
    where?: RoleWhereInput
    data: XOR<RoleUpdateWithoutPermissionsInput, RoleUncheckedUpdateWithoutPermissionsInput>
  }

  export type RoleUpdateWithoutPermissionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    desc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: OrgUserRoleUpdateManyWithoutRoleNestedInput
  }

  export type RoleUncheckedUpdateWithoutPermissionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    desc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: OrgUserRoleUncheckedUpdateManyWithoutRoleNestedInput
  }

  export type PermissionUpsertWithoutRolesInput = {
    update: XOR<PermissionUpdateWithoutRolesInput, PermissionUncheckedUpdateWithoutRolesInput>
    create: XOR<PermissionCreateWithoutRolesInput, PermissionUncheckedCreateWithoutRolesInput>
    where?: PermissionWhereInput
  }

  export type PermissionUpdateToOneWithWhereWithoutRolesInput = {
    where?: PermissionWhereInput
    data: XOR<PermissionUpdateWithoutRolesInput, PermissionUncheckedUpdateWithoutRolesInput>
  }

  export type PermissionUpdateWithoutRolesInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    group?: NullableStringFieldUpdateOperationsInput | string | null
    desc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PermissionUncheckedUpdateWithoutRolesInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    group?: NullableStringFieldUpdateOperationsInput | string | null
    desc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrgUserCreateWithoutRolesInput = {
    id?: string
    tenantId: string
    email: string
    passwordHash: string
    displayName: string
    isActive?: boolean
    totpSecret?: string | null
    isTotpEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    auditLogs?: AuditLogCreateNestedManyWithoutOrgUserInput
  }

  export type OrgUserUncheckedCreateWithoutRolesInput = {
    id?: string
    tenantId: string
    email: string
    passwordHash: string
    displayName: string
    isActive?: boolean
    totpSecret?: string | null
    isTotpEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutOrgUserInput
  }

  export type OrgUserCreateOrConnectWithoutRolesInput = {
    where: OrgUserWhereUniqueInput
    create: XOR<OrgUserCreateWithoutRolesInput, OrgUserUncheckedCreateWithoutRolesInput>
  }

  export type RoleCreateWithoutUsersInput = {
    id?: string
    tenantId: string
    name: string
    desc?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    permissions?: RolePermissionCreateNestedManyWithoutRoleInput
  }

  export type RoleUncheckedCreateWithoutUsersInput = {
    id?: string
    tenantId: string
    name: string
    desc?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    permissions?: RolePermissionUncheckedCreateNestedManyWithoutRoleInput
  }

  export type RoleCreateOrConnectWithoutUsersInput = {
    where: RoleWhereUniqueInput
    create: XOR<RoleCreateWithoutUsersInput, RoleUncheckedCreateWithoutUsersInput>
  }

  export type OrgUserUpsertWithoutRolesInput = {
    update: XOR<OrgUserUpdateWithoutRolesInput, OrgUserUncheckedUpdateWithoutRolesInput>
    create: XOR<OrgUserCreateWithoutRolesInput, OrgUserUncheckedCreateWithoutRolesInput>
    where?: OrgUserWhereInput
  }

  export type OrgUserUpdateToOneWithWhereWithoutRolesInput = {
    where?: OrgUserWhereInput
    data: XOR<OrgUserUpdateWithoutRolesInput, OrgUserUncheckedUpdateWithoutRolesInput>
  }

  export type OrgUserUpdateWithoutRolesInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    totpSecret?: NullableStringFieldUpdateOperationsInput | string | null
    isTotpEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    auditLogs?: AuditLogUpdateManyWithoutOrgUserNestedInput
  }

  export type OrgUserUncheckedUpdateWithoutRolesInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    totpSecret?: NullableStringFieldUpdateOperationsInput | string | null
    isTotpEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    auditLogs?: AuditLogUncheckedUpdateManyWithoutOrgUserNestedInput
  }

  export type RoleUpsertWithoutUsersInput = {
    update: XOR<RoleUpdateWithoutUsersInput, RoleUncheckedUpdateWithoutUsersInput>
    create: XOR<RoleCreateWithoutUsersInput, RoleUncheckedCreateWithoutUsersInput>
    where?: RoleWhereInput
  }

  export type RoleUpdateToOneWithWhereWithoutUsersInput = {
    where?: RoleWhereInput
    data: XOR<RoleUpdateWithoutUsersInput, RoleUncheckedUpdateWithoutUsersInput>
  }

  export type RoleUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    desc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permissions?: RolePermissionUpdateManyWithoutRoleNestedInput
  }

  export type RoleUncheckedUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    desc?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permissions?: RolePermissionUncheckedUpdateManyWithoutRoleNestedInput
  }

  export type GlobalUserCreateWithoutAuditLogsInput = {
    id?: string
    email: string
    passwordHash: string
    totpSecret?: string | null
    isTotpEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    organisations?: OrganisationCreateNestedManyWithoutOwnerInput
    organisationAdmins?: OrganisationAdminCreateNestedManyWithoutGlobalUserInput
  }

  export type GlobalUserUncheckedCreateWithoutAuditLogsInput = {
    id?: string
    email: string
    passwordHash: string
    totpSecret?: string | null
    isTotpEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    organisations?: OrganisationUncheckedCreateNestedManyWithoutOwnerInput
    organisationAdmins?: OrganisationAdminUncheckedCreateNestedManyWithoutGlobalUserInput
  }

  export type GlobalUserCreateOrConnectWithoutAuditLogsInput = {
    where: GlobalUserWhereUniqueInput
    create: XOR<GlobalUserCreateWithoutAuditLogsInput, GlobalUserUncheckedCreateWithoutAuditLogsInput>
  }

  export type OrgUserCreateWithoutAuditLogsInput = {
    id?: string
    tenantId: string
    email: string
    passwordHash: string
    displayName: string
    isActive?: boolean
    totpSecret?: string | null
    isTotpEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    roles?: OrgUserRoleCreateNestedManyWithoutOrgUserInput
  }

  export type OrgUserUncheckedCreateWithoutAuditLogsInput = {
    id?: string
    tenantId: string
    email: string
    passwordHash: string
    displayName: string
    isActive?: boolean
    totpSecret?: string | null
    isTotpEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    roles?: OrgUserRoleUncheckedCreateNestedManyWithoutOrgUserInput
  }

  export type OrgUserCreateOrConnectWithoutAuditLogsInput = {
    where: OrgUserWhereUniqueInput
    create: XOR<OrgUserCreateWithoutAuditLogsInput, OrgUserUncheckedCreateWithoutAuditLogsInput>
  }

  export type GlobalUserUpsertWithoutAuditLogsInput = {
    update: XOR<GlobalUserUpdateWithoutAuditLogsInput, GlobalUserUncheckedUpdateWithoutAuditLogsInput>
    create: XOR<GlobalUserCreateWithoutAuditLogsInput, GlobalUserUncheckedCreateWithoutAuditLogsInput>
    where?: GlobalUserWhereInput
  }

  export type GlobalUserUpdateToOneWithWhereWithoutAuditLogsInput = {
    where?: GlobalUserWhereInput
    data: XOR<GlobalUserUpdateWithoutAuditLogsInput, GlobalUserUncheckedUpdateWithoutAuditLogsInput>
  }

  export type GlobalUserUpdateWithoutAuditLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    totpSecret?: NullableStringFieldUpdateOperationsInput | string | null
    isTotpEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organisations?: OrganisationUpdateManyWithoutOwnerNestedInput
    organisationAdmins?: OrganisationAdminUpdateManyWithoutGlobalUserNestedInput
  }

  export type GlobalUserUncheckedUpdateWithoutAuditLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    totpSecret?: NullableStringFieldUpdateOperationsInput | string | null
    isTotpEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organisations?: OrganisationUncheckedUpdateManyWithoutOwnerNestedInput
    organisationAdmins?: OrganisationAdminUncheckedUpdateManyWithoutGlobalUserNestedInput
  }

  export type OrgUserUpsertWithoutAuditLogsInput = {
    update: XOR<OrgUserUpdateWithoutAuditLogsInput, OrgUserUncheckedUpdateWithoutAuditLogsInput>
    create: XOR<OrgUserCreateWithoutAuditLogsInput, OrgUserUncheckedCreateWithoutAuditLogsInput>
    where?: OrgUserWhereInput
  }

  export type OrgUserUpdateToOneWithWhereWithoutAuditLogsInput = {
    where?: OrgUserWhereInput
    data: XOR<OrgUserUpdateWithoutAuditLogsInput, OrgUserUncheckedUpdateWithoutAuditLogsInput>
  }

  export type OrgUserUpdateWithoutAuditLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    totpSecret?: NullableStringFieldUpdateOperationsInput | string | null
    isTotpEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    roles?: OrgUserRoleUpdateManyWithoutOrgUserNestedInput
  }

  export type OrgUserUncheckedUpdateWithoutAuditLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    totpSecret?: NullableStringFieldUpdateOperationsInput | string | null
    isTotpEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    roles?: OrgUserRoleUncheckedUpdateManyWithoutOrgUserNestedInput
  }

  export type OrganisationCreateManyOwnerInput = {
    id?: string
    name: string
    slug: string
    branding?: NullableJsonNullValueInput | InputJsonValue
    features?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrganisationAdminCreateManyGlobalUserInput = {
    id?: string
    organisationId: string
    role?: string
    createdAt?: Date | string
  }

  export type AuditLogCreateManyUserInput = {
    id?: string
    tenantId: string
    action: $Enums.AuditAction
    entityType: $Enums.AuditEntityType
    entityId: string
    orgUserId?: string | null
    details?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
  }

  export type OrganisationUpdateWithoutOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    branding?: NullableJsonNullValueInput | InputJsonValue
    features?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    admins?: OrganisationAdminUpdateManyWithoutOrganisationNestedInput
  }

  export type OrganisationUncheckedUpdateWithoutOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    branding?: NullableJsonNullValueInput | InputJsonValue
    features?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    admins?: OrganisationAdminUncheckedUpdateManyWithoutOrganisationNestedInput
  }

  export type OrganisationUncheckedUpdateManyWithoutOwnerInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    branding?: NullableJsonNullValueInput | InputJsonValue
    features?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganisationAdminUpdateWithoutGlobalUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organisation?: OrganisationUpdateOneRequiredWithoutAdminsNestedInput
  }

  export type OrganisationAdminUncheckedUpdateWithoutGlobalUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    organisationId?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganisationAdminUncheckedUpdateManyWithoutGlobalUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    organisationId?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    action?: EnumAuditActionFieldUpdateOperationsInput | $Enums.AuditAction
    entityType?: EnumAuditEntityTypeFieldUpdateOperationsInput | $Enums.AuditEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orgUser?: OrgUserUpdateOneWithoutAuditLogsNestedInput
  }

  export type AuditLogUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    action?: EnumAuditActionFieldUpdateOperationsInput | $Enums.AuditAction
    entityType?: EnumAuditEntityTypeFieldUpdateOperationsInput | $Enums.AuditEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    orgUserId?: NullableStringFieldUpdateOperationsInput | string | null
    details?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    action?: EnumAuditActionFieldUpdateOperationsInput | $Enums.AuditAction
    entityType?: EnumAuditEntityTypeFieldUpdateOperationsInput | $Enums.AuditEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    orgUserId?: NullableStringFieldUpdateOperationsInput | string | null
    details?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganisationAdminCreateManyOrganisationInput = {
    id?: string
    globalUserId: string
    role?: string
    createdAt?: Date | string
  }

  export type OrganisationAdminUpdateWithoutOrganisationInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    globalUser?: GlobalUserUpdateOneRequiredWithoutOrganisationAdminsNestedInput
  }

  export type OrganisationAdminUncheckedUpdateWithoutOrganisationInput = {
    id?: StringFieldUpdateOperationsInput | string
    globalUserId?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganisationAdminUncheckedUpdateManyWithoutOrganisationInput = {
    id?: StringFieldUpdateOperationsInput | string
    globalUserId?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrgUserRoleCreateManyOrgUserInput = {
    id?: string
    tenantId: string
    roleId: string
    createdAt?: Date | string
  }

  export type AuditLogCreateManyOrgUserInput = {
    id?: string
    tenantId: string
    action: $Enums.AuditAction
    entityType: $Enums.AuditEntityType
    entityId: string
    userId?: string | null
    details?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    createdAt?: Date | string
  }

  export type OrgUserRoleUpdateWithoutOrgUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: RoleUpdateOneRequiredWithoutUsersNestedInput
  }

  export type OrgUserRoleUncheckedUpdateWithoutOrgUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    roleId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrgUserRoleUncheckedUpdateManyWithoutOrgUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    roleId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUpdateWithoutOrgUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    action?: EnumAuditActionFieldUpdateOperationsInput | $Enums.AuditAction
    entityType?: EnumAuditEntityTypeFieldUpdateOperationsInput | $Enums.AuditEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: GlobalUserUpdateOneWithoutAuditLogsNestedInput
  }

  export type AuditLogUncheckedUpdateWithoutOrgUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    action?: EnumAuditActionFieldUpdateOperationsInput | $Enums.AuditAction
    entityType?: EnumAuditEntityTypeFieldUpdateOperationsInput | $Enums.AuditEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    details?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUncheckedUpdateManyWithoutOrgUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    action?: EnumAuditActionFieldUpdateOperationsInput | $Enums.AuditAction
    entityType?: EnumAuditEntityTypeFieldUpdateOperationsInput | $Enums.AuditEntityType
    entityId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    details?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RolePermissionCreateManyRoleInput = {
    id?: string
    tenantId: string
    permissionId: string
    createdAt?: Date | string
  }

  export type OrgUserRoleCreateManyRoleInput = {
    id?: string
    tenantId: string
    orgUserId: string
    createdAt?: Date | string
  }

  export type RolePermissionUpdateWithoutRoleInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    permission?: PermissionUpdateOneRequiredWithoutRolesNestedInput
  }

  export type RolePermissionUncheckedUpdateWithoutRoleInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    permissionId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RolePermissionUncheckedUpdateManyWithoutRoleInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    permissionId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrgUserRoleUpdateWithoutRoleInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orgUser?: OrgUserUpdateOneRequiredWithoutRolesNestedInput
  }

  export type OrgUserRoleUncheckedUpdateWithoutRoleInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    orgUserId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrgUserRoleUncheckedUpdateManyWithoutRoleInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    orgUserId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RolePermissionCreateManyPermissionInput = {
    id?: string
    tenantId: string
    roleId: string
    createdAt?: Date | string
  }

  export type RolePermissionUpdateWithoutPermissionInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    role?: RoleUpdateOneRequiredWithoutPermissionsNestedInput
  }

  export type RolePermissionUncheckedUpdateWithoutPermissionInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    roleId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RolePermissionUncheckedUpdateManyWithoutPermissionInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    roleId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}