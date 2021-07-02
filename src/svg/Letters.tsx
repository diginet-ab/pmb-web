import * as React from 'react';
import { SVGProps } from 'react';
import letterB from './b.svg'
import letterE from './e.svg'
import letterN from './n.svg'
import letterS from './s.svg'
import letterT from './t.svg'

export const LetterB = (props: SVGProps<SVGSVGElement>) => {
    return <div>
        <img style={{ position: 'relative', top: '50%', transform: 'translateY(35%)' }} src={letterB} height={32} alt="logo" />
    </div>
}

export const LetterE = (props: SVGProps<SVGSVGElement>) => {
    return <div>
        <img style={{ position: 'relative', top: '50%', transform: 'translateY(35%)' }} src={letterE} height={32} alt="logo" />
    </div>
}
export const LetterN = (props: SVGProps<SVGSVGElement>) => {
    return <div>
        <img style={{ position: 'relative', top: '50%', transform: 'translateY(35%)' }} src={letterN} height={32} alt="logo" />
    </div>
}
export const LetterS = (props: SVGProps<SVGSVGElement>) => {
    return <div>
        <img style={{ position: 'relative', top: '50%', transform: 'translateY(35%)' }} src={letterS} height={32} alt="logo" />
    </div>
}
export const LetterT = (props: SVGProps<SVGSVGElement>) => {
    return <div>
        <img style={{ position: 'relative', top: '50%', transform: 'translateY(35%)' }} src={letterT} height={32} alt="logo" />
    </div>
}
