import * as React from 'react';
import { SVGProps } from 'react';
import airSiteLogo from './NIBE_AirSite_vector_logo.svg'

export const Logo = (props: SVGProps<SVGSVGElement>) => {
    return <div id="14131eafrwe" >
        <img style={{ position: 'relative', top: '50%', transform: 'translateY(35%)' }} src={airSiteLogo} height={32} alt="logo" />
    </div>
}