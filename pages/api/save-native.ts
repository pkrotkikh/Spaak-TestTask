import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';


type ExternalData = {
    id: number;
    typeid: number;
    kategoriid: number;
    statusid: number;

    title: string;
    content: string;
    stage: string;

    titel: string;
    titelkort: string;
    offentlighedskode: string;
    nummer: string;
    nummerprefix: string;
    nummernumerisk: string;
    nummerpostfix: string;
    resume: string;
    afstemningskonklusion: string;

    periodeid: number;
    afgørelsesresultatkode: string;
    baggrundsmateriale: string;
    opdateringsdato: Date;

    statsbudgetsag: boolean;
    begrundelse: string;
    paragrafnummer: string;
    paragraf: string;
    afgørelsesdato: Date;
    afgørelse: string;
    rådsmødedato: Date;
    lovnummer: string;
    lovnummerdato: Date;
    retsinformationsurl: string;
    fremsatundersagid: string;
    deltundersagid: string;
};

type ApiResponse = {
    value: ExternalData[];
};

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const stages = ['Fremast', '1. Behandling', '2. Behandling', '3. Behandling', 'Færdig'];
const titles = ['FIU alm. del', 'Traditionel', 'Europa-Parlamentets', 'Om digital kommunikation', 'High Level Segment Session']
const content = ['Finder ministeren det acceptabelt...', 'Hvad er ministerens holdning til...', 'Vil ministeren følge forslaget...', 'Der henvises til TV2s...' ]
const paginations = ['', '?$skip=100', '?$skip=200', '?$skip=300', '?$skip=400', '?$skip=500', '?$skip=600']


async function fetchAndSaveData() {
    for (const paginate of paginations) {
        // 1. Receive data from endpoint:
        const response = await fetch('https://oda.ft.dk/api/Sag' + paginate);
        if (!response.ok) {
            throw new Error(`Error while receiving data: ${response.statusText}`);
        }

        // 2. Casting to the proper type:
        const result: ApiResponse = await response.json();
        const data = result.value;

        // 3. Filter data based on typeid and periodeid
        const filteredData = data.filter(
            item => [3, 5, 9].includes(item.typeid)
                || item.periodeid === 160
        );

        for (const item of filteredData) {
            // 4. Gather all needed information into form and create record:
            const randomStage = stages[Math.floor(Math.random() * stages.length)];
            const randomTitle = titles[Math.floor(Math.random() * titles.length)];
            const randomContent = content[Math.floor(Math.random() * content.length)];

            let query =
                'INSERT INTO "Post" (id, typeid, kategoriid, statusid, titel, titelkort, offentlighedskode,' +
                'nummer, nummerprefix, nummernumerisk, nummerpostfix, resume, afstemningskonklusion,' +
                'periodeid, afgorelsesresultatkode, baggrundsmateriale, opdateringsdato,' +
                'statsbudgetsag, begrundelse, paragrafnummer, paragraf, afgorelsesdato,' +
                'afgorelse, radsmodedato, lovnummer, lovnummerdato, retsinformationsurl,' +
                'fremsatundersagid, deltundersagid, stage, title, content) ' +
                'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,' +
                '$11, $12, $13, $14, $15, $16, $17, $18, $19, $20,' +
                '$21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32)';

            let values = [
                item.id,                    //$1
                item.typeid,                //$2
                item.kategoriid,            //$3
                item.statusid,              //$4
                item.titel,                 //$5
                item.titelkort,             //$6
                item.offentlighedskode,     //$7
                item.nummer,                //$8
                item.nummerprefix,          //$9
                item.nummernumerisk,        //$10
                item.nummerpostfix,         //$11
                item.resume,                //$12
                item.afstemningskonklusion, //$13
                item.periodeid,             //$14
                item.afgørelsesresultatkode,//$15
                item.baggrundsmateriale,    //$16
                item.opdateringsdato,       //$17
                item.statsbudgetsag,        //$18
                item.begrundelse,           //$19
                item.paragrafnummer,        //$20
                item.paragraf,              //$21
                item.afgørelsesdato,        //$22
                item.afgørelse,             //$23
                item.rådsmødedato,          //$24
                item.lovnummer,             //$25
                item.lovnummerdato,         //$26
                item.retsinformationsurl,   //$27
                item.fremsatundersagid,     //$28
                item.deltundersagid,        //$29
                randomStage,                //$30
                randomTitle,                //$31
                randomContent,              //$32
            ];

            await pool.query(query, values);
        }
    }
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {

        await fetchAndSaveData();
        res.status(200).json({
            success: true,
            message: 'The data has been successfully saved to the database.',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error while saving data',
            error: (error as Error).message,
        });
    }
}
