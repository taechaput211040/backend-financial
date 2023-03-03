import { CacheModule, HttpModule, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
@Module({
    imports: [
    CacheModule.register({ 
        store: redisStore,
        host: process.env.REDIS_SERVER,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
        ttl: null,
        db: 7
    
      }),
      ], 
    controllers: [],
    providers: [],
})
export class CacheMemberModule {};