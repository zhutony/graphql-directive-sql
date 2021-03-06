import * as fs from 'fs'
import gql from 'graphql-tag'
import {
  makeSqlSchema,
  getSchemaDirectives,
  sqlDirectiveDeclaration,
} from '../src'

test('main test', () => {
  const typeDefs = gql`
    directive @sql(
      unicode: Boolean
      constraints: String
      auto: Boolean
      default: String
      index: Boolean
      nullable: Boolean
      primary: Boolean
      type: String
      unique: Boolean
    ) on OBJECT | FIELD_DEFINITION

    # See graphql-directive-private
    directive @private on OBJECT | FIELD_DEFINITION

    type User @sql(unicode: true) {
      userId: String @sql(type: "BINARY(16)", primary: true)
      uniqueColumn: Int @sql(unique: true)
      databaseOnlyField: Int @sql @private

      graphqlOnlyField: String
      posts: [Post]
    }

    type Post {
      postId: Int @sql(primary: true, auto: true)
      userId: String @sql(type: "BINARY(16)", index: true)
      content: String @sql(type: "VARCHAR(300)", unicode: true, nullable: true)
      likes: Int @sql
      dateCreated: String @sql(type: "TIMESTAMP", default: "CURRENT_TIMESTAMP")
    }

    type UserPair
      @sql(
        constraints: "UNIQUE(parentUserId, childUserId),\\n  FOREIGN KEY (parentUserId) REFERENCES User(userId)"
      ) {
      userPairId: String @sql(type: "BINARY(16)", primary: true)
      parentUserId: String @sql(type: "BINARY(16)", index: true)
      childUserId: String @sql(type: "BINARY(16)", index: true)
    }
  `

  const outputFilepath = '__tests__/testOutput.sql'
  const directives = getSchemaDirectives()
  makeSqlSchema({
    typeDefs,
    schemaDirectives: directives,
    outputFilepath,
    databaseName: 'dbname',
    tablePrefix: 'test_',
  })

  const testOutput = fs.readFileSync(outputFilepath, { encoding: 'utf8' })
  expect(testOutput).toEqual(
    `CREATE TABLE \`dbname\`.\`test_User\` (
  \`userId\` BINARY(16) NOT NULL,
  \`uniqueColumn\` INT NOT NULL UNIQUE,
  \`databaseOnlyField\` INT NOT NULL,
  PRIMARY KEY (\`userId\`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE \`dbname\`.\`test_Post\` (
  \`postId\` INT NOT NULL AUTO_INCREMENT,
  \`userId\` BINARY(16) NOT NULL,
  \`content\` VARCHAR(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  \`likes\` INT NOT NULL,
  \`dateCreated\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`postId\`),
  INDEX \`USERIDINDEX\` (\`userId\` ASC)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE \`dbname\`.\`test_UserPair\` (
  \`userPairId\` BINARY(16) NOT NULL,
  \`parentUserId\` BINARY(16) NOT NULL,
  \`childUserId\` BINARY(16) NOT NULL,
  PRIMARY KEY (\`userPairId\`),
  INDEX \`PARENTUSERIDINDEX\` (\`parentUserId\` ASC),
  INDEX \`CHILDUSERIDINDEX\` (\`childUserId\` ASC),
  UNIQUE(parentUserId, childUserId),
  FOREIGN KEY (parentUserId) REFERENCES User(userId)
);`
  )
})

test('error no primary index', () => {
  const typeDefs = `
    ${sqlDirectiveDeclaration}
  
    type User @sql(unicode: true) {
      userId: String @sql(type: "BINARY(16)")
    }
  `

  const directives = getSchemaDirectives()
  expect(() => {
    makeSqlSchema({
      typeDefs,
      schemaDirectives: directives,
      outputFilepath: '',
      databaseName: 'dbname',
    })
  }).toThrow()
})

test('error multiple primary index', () => {
  const typeDefs = `
    ${sqlDirectiveDeclaration}
  
    type User @sql(unicode: true) {
      userId: String @sql(primary: true)
      postId: String @sql(primary: true)
    }
  `

  const directives = getSchemaDirectives()
  expect(() => {
    makeSqlSchema({
      typeDefs,
      schemaDirectives: directives,
      outputFilepath: '',
      databaseName: 'dbname',
    })
  }).toThrow()
})
