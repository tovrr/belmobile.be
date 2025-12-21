import { MODELS as AppleModels, SPECS as AppleSpecs } from './models/apple';
import { MODELS as SamsungModels, SPECS as SamsungSpecs } from './models/samsung';
import { MODELS as GoogleModels, SPECS as GoogleSpecs } from './models/google';
import { MODELS as HuaweiModels } from './models/huawei';
import { MODELS as OnePlusModels } from './models/oneplus';
import { MODELS as XiaomiModels } from './models/xiaomi';
import { MODELS as OppoModels } from './models/oppo';
import { MODELS as SonyModels } from './models/sony';
import { MODELS as MicrosoftModels } from './models/microsoft';
import { MODELS as LenovoModels } from './models/lenovo';
import { MODELS as HPModels } from './models/hp';
import { MODELS as DellModels } from './models/dell';
import { MODELS as NintendoModels } from './models/nintendo';
import { MODELS as XboxModels } from './models/xbox';

export const modelsData: Record<string, any> = {
    'apple': AppleModels,
    'samsung': SamsungModels,
    'google': GoogleModels,
    'huawei': HuaweiModels,
    'oneplus': OnePlusModels,
    'xiaomi': XiaomiModels,
    'oppo': OppoModels,
    'sony': SonyModels,
    'microsoft': MicrosoftModels,
    'lenovo': LenovoModels,
    'hp': HPModels,
    'dell': DellModels,
    'nintendo': NintendoModels,
    'xbox': XboxModels,
};

export const specsData: Record<string, string[]> = {
    ...AppleSpecs,
    ...SamsungSpecs,
    ...GoogleSpecs,
};
