import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
} from 'graphql';
import axios from 'axios';

const baseUrl = 'http://localhost:3000';

const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      resolve(parentValue, args) {
        return axios.get(`${baseUrl}/companies/${parentValue.id}/users`)
          .then(response => response.data)
      }
    }
  })
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: { 
      type: CompanyType,
      resolve(parentValue, args) {
        return axios.get(`${baseUrl}/companies/${parentValue.companyId}`)
          .then(response => response.data)
      } 
    }
  }),
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString }},
      resolve(parentValue, args) {
        return axios.get(`${baseUrl}/users/${args.id}`)
          .then(response => response.data)
      }
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios.get(`${baseUrl}/companies/${args.id}`)
          .then(response => response.data)
      }
    }
  },
});

const RootMutation = new GraphQLObjectType({
  name: 'RootMutation',
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) }, 
        companyId: { type: GraphQLString },
      },
      resolve(parentValue, args) {
        return axios.post(`${baseUrl}/users`, args)
          .then(response => response.data)
      }
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(parentValue, args) {
        return axios.delete(`${baseUrl}/users/${args.id}`)
          .then(response => response.data)
      }
    },
    editUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLString },
      },
      resolve(parentValue, args){
        return axios.patch(`${baseUrl}/users/${args.id}`, args)
          .then(response => response.data)
      }
    }
  }
});

export const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});