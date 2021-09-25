import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { S3 } from 'aws-sdk'
import { GraphQLClient, gql } from 'graphql-request'
import { TokenService } from './auth/token.service'

@Injectable()
export class FileService {
  constructor(
    private configService: ConfigService,
    private tokenService: TokenService
  ) {}

  upload(buffer, fileName, fileMimeType, bucket) {
    const s3 = new S3({
      accessKeyId: this.configService.get('S3_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('S3_SECRET_ACCESS_KEY'),
      endpoint: this.configService.get('S3_ENDPOINT'),
      s3ForcePathStyle: true,
      signatureVersion: 'v4'
    })

    return new Promise(async (resolve,reject) => {
      try {
        const r = await s3.upload({
          Bucket: `${this.configService.get('NODE_ENV')}/${bucket}`,
          Body: buffer,
          ContentType: fileMimeType,
          Key: fileName,
          ACL: "public-read",
        }).promise()
  
        resolve(
          r.Location.replace(
            this.configService.get('S3_ENDPOINT') + '/',
            ''
          )
        ) 
      } catch (error) {
        reject(error)
      }
    })
  }

  delete(data, bucket, token) {
    const s3 = new S3({
      accessKeyId: this.configService.get('S3_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('S3_SECRET_ACCESS_KEY'),
      endpoint: this.configService.get('S3_ENDPOINT'),
      s3ForcePathStyle: true,
      signatureVersion: 'v4'
    })

    return new Promise(async (resolve, reject) => {
      try {
        const userDecoded = this.tokenService.decode(token);
        
        try {
          const mutations = gql`
            mutation deleteImage($id: Int!) {
              delete_images_by_pk(id: $id) {
                id
              } 
            }
          `;

          const variables = {
            id: data.id,
          }

          const graphQLClient = new GraphQLClient(
            this.configService.get('HASURA_GRAPHQL_ENDPOINT'),
            {
              headers: {
                'Authorization': token,
                'X-Hasura-Role': 'user',
                'X-Hasura-Role-Id': userDecoded.sub
              },
            }
          )

          await graphQLClient.request(mutations, variables);

          try {
            console.log(data.path.replace(
              `${this.configService.get('NODE_ENV')}/${bucket}/`,
              ""
            ));
            
            await s3.deleteObject({
              Bucket: `${this.configService.get('NODE_ENV')}/${bucket}`,
              Key: data.path.replace(
                `${this.configService.get('NODE_ENV')}/${bucket}/`,
                ""
              )
            }).promise();

            resolve(true)
          } catch (error) {
            reject(error)
          }
        } catch (error) {
          reject(error)
        }
      } catch (error) {
        reject(error)
      }
    })
  }
}