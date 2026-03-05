import {
    provideTransloco,
    TranslocoModule
} from '@jsverse/transloco';
import { Injectable, isDevMode, NgModule } from '@angular/core';
import { Translation, TranslocoLoader } from "@jsverse/transloco";
import { TranslocoHttpLoader } from './translocohttploader';
import { provideHttpClient } from '@angular/common/http';



@NgModule({
    exports: [ TranslocoModule ],
    providers: [
        provideHttpClient(),
        provideTransloco({
            config: {
                availableLangs: ['en', 'es'],
                defaultLang: 'en',
            },
            loader: TranslocoHttpLoader

        }),
    ],
})
export class TranslocoRootModule {}
