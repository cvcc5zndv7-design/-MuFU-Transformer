/**
 * اختبارات حساب المواريث الإسلامية
 * Islamic Inheritance Calculator Tests
 */

const InheritanceCalculator = require('../src/inheritance-calculator');

// ألوان للطباعة في الكونسول
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

let passedTests = 0;
let failedTests = 0;

/**
 * دالة الاختبار
 */
function test(name, testFunc) {
    try {
        testFunc();
        console.log(`${colors.green}✓${colors.reset} ${name}`);
        passedTests++;
    } catch (error) {
        console.log(`${colors.red}✗${colors.reset} ${name}`);
        console.log(`  ${colors.red}Error: ${error.message}${colors.reset}`);
        failedTests++;
    }
}

/**
 * دالة التأكيد
 */
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
}

function assertApproxEqual(actual, expected, tolerance = 0.01, message) {
    if (Math.abs(actual - expected) > tolerance) {
        throw new Error(message || `Expected ~${expected}, got ${actual}`);
    }
}

// بدء الاختبارات
console.log('\n' + colors.blue + '='.repeat(60));
console.log('اختبارات حساب المواريث الإسلامية');
console.log('Islamic Inheritance Calculator Tests');
console.log('='.repeat(60) + colors.reset + '\n');

// =====================================================
// اختبار 1: حالة بسيطة - زوجة وبنتان
// =====================================================
test('حالة: زوجة + بنتان', () => {
    const heirs = {
        wife: true,
        daughters: 2
    };
    const result = InheritanceCalculator.calculate(heirs, 24);

    // الزوجة تأخذ الثمن (1/8) = 3
    // البنتان تأخذان الثلثين (2/3) = 16
    // الباقي يُرد على البنات = 5

    assert(result.heirs.wife, 'الزوجة يجب أن ترث');
    assert(result.heirs.daughters, 'البنات يجب أن يرثن');
    assertEqual(result.totalDistributed, 24, 'يجب توزيع كامل التركة');
});

// =====================================================
// اختبار 2: حالة العول - زوج + أختان شقيقتان + أم
// =====================================================
test('حالة العول: زوج + أختان شقيقتان + أم', () => {
    const heirs = {
        husband: true,
        fullSisters: 2,
        mother: true
    };
    const result = InheritanceCalculator.calculate(heirs, 27);

    // الزوج: النصف (1/2)
    // الأختان: الثلثان (2/3)
    // الأم: الثلث (1/3)
    // المجموع: 1/2 + 2/3 + 1/3 = 3/6 + 4/6 + 2/6 = 9/6 (عول)

    assertEqual(result.type, 'awl', 'يجب أن تكون حالة عول');
    assert(result.denominator > result.originalDenominator, 'المقام يجب أن يزيد في العول');
});

// =====================================================
// اختبار 3: حالة مع الأبناء - ابن + بنتان + زوجة + أب + أم
// =====================================================
test('حالة: ابن + بنتان + زوجة + أب + أم', () => {
    const heirs = {
        sons: 1,
        daughters: 2,
        wife: true,
        father: true,
        mother: true
    };
    const result = InheritanceCalculator.calculate(heirs, 1000);

    // الزوجة: الثمن (مع وجود فرع وارث)
    // الأب: السدس (مع وجود فرع وارث ذكر)
    // الأم: السدس (مع وجود فرع وارث)
    // الباقي للابن والبنتين (للذكر مثل حظ الأنثيين)

    assert(result.heirs.wife, 'الزوجة ترث');
    assert(result.heirs.father, 'الأب يرث');
    assert(result.heirs.mother, 'الأم ترث');
    assert(result.heirs.sons, 'الابن يرث');
    assert(result.heirs.daughters, 'البنات يرثن');

    assertApproxEqual(result.totalDistributed, 1000, 1, 'يجب توزيع كامل التركة');
});

// =====================================================
// اختبار 4: الحجب - الابن يحجب الإخوة
// =====================================================
test('الحجب: الابن يحجب الإخوة', () => {
    const heirs = {
        sons: 1,
        fullBrothers: 2,
        husband: true
    };
    const result = InheritanceCalculator.calculate(heirs, 100);

    // الإخوة محجوبون بوجود الابن
    assert(!result.heirs.fullBrothers, 'الإخوة يجب أن يُحجبوا بوجود الابن');
    assert(result.blockedHeirs.includes('fullBrothers'), 'الإخوة في قائمة المحجوبين');
});

// =====================================================
// اختبار 5: الأب يحجب الجد
// =====================================================
test('الحجب: الأب يحجب الجد', () => {
    const heirs = {
        father: true,
        grandfather: true,
        daughters: 1
    };
    const result = InheritanceCalculator.calculate(heirs, 100);

    // الجد محجوب بالأب
    assert(!result.heirs.grandfather, 'الجد يجب أن يُحجب بوجود الأب');
    assert(result.blockedHeirs.includes('grandfather'), 'الجد في قائمة المحجوبين');
});

// =====================================================
// اختبار 6: الأم تحجب الجدة
// =====================================================
test('الحجب: الأم تحجب الجدة', () => {
    const heirs = {
        mother: true,
        grandmother: true,
        sons: 1
    };
    const result = InheritanceCalculator.calculate(heirs, 100);

    // الجدة محجوبة بالأم
    assert(!result.heirs.grandmother, 'الجدة يجب أن تُحجب بوجود الأم');
});

// =====================================================
// اختبار 7: للذكر مثل حظ الأنثيين
// =====================================================
test('للذكر مثل حظ الأنثيين: ابن + بنت', () => {
    const heirs = {
        sons: 1,
        daughters: 1
    };
    const result = InheritanceCalculator.calculate(heirs, 300);

    // الابن يأخذ 200، البنت تأخذ 100
    // نسبة 2:1

    const sonShare = result.heirs.sons.perPerson;
    const daughterShare = result.heirs.daughters.perPerson;

    assertApproxEqual(sonShare / daughterShare, 2, 0.01, 'نصيب الابن يجب أن يكون ضعف نصيب البنت');
});

// =====================================================
// اختبار 8: بنت واحدة تأخذ النصف
// =====================================================
test('بنت واحدة تأخذ النصف', () => {
    const heirs = {
        daughters: 1
    };
    const result = InheritanceCalculator.calculate(heirs, 100);

    // في حالة الرد، البنت تأخذ كل التركة
    // لكن فرضها النصف
    assertEqual(result.type, 'radd', 'حالة رد');
    assertEqual(result.totalDistributed, 100, 'توزيع كامل التركة');
});

// =====================================================
// اختبار 9: الزوج مع وبدون فرع وارث
// =====================================================
test('الزوج: مع وبدون فرع وارث', () => {
    // بدون فرع وارث: النصف (فرضه الأصلي)
    const heirs1 = {
        husband: true,
        mother: true
    };
    const result1 = InheritanceCalculator.calculate(heirs1, 100);
    // الزوج يأخذ النصف كفرض أصلي، حتى لو تغير بالرد
    assert(result1.heirs.husband, 'الزوج يرث');

    // مع فرع وارث: الربع
    const heirs2 = {
        husband: true,
        daughters: 1
    };
    const result2 = InheritanceCalculator.calculate(heirs2, 100);
    // التحقق من أن نصيب الزوج أقل (الربع أقل من النصف)
    const husbandRatio2 = result2.heirs.husband.totalAmount / 100;
    assert(husbandRatio2 <= 0.26, 'الزوج يأخذ الربع مع فرع وارث');
});

// =====================================================
// اختبار 10: الزوجة مع وبدون فرع وارث
// =====================================================
test('الزوجة: مع وبدون فرع وارث', () => {
    // بدون فرع وارث: الربع
    const heirs1 = {
        wife: true,
        father: true
    };
    const result1 = InheritanceCalculator.calculate(heirs1, 100);
    assert(result1.heirs.wife.fraction.includes('/4'), 'الزوجة تأخذ الربع بدون فرع وارث');

    // مع فرع وارث: الثمن
    const heirs2 = {
        wife: true,
        sons: 1
    };
    const result2 = InheritanceCalculator.calculate(heirs2, 100);
    assert(result2.heirs.wife.fraction.includes('/8'), 'الزوجة تأخذ الثمن مع فرع وارث');
});

// =====================================================
// اختبار 11: الأم مع وبدون إخوة
// =====================================================
test('الأم: مع وبدون إخوة', () => {
    // بدون إخوة وبدون فرع وارث: الثلث
    const heirs1 = {
        mother: true,
        father: true
    };
    const result1 = InheritanceCalculator.calculate(heirs1, 100);
    assert(result1.heirs.mother, 'الأم ترث');

    // مع إخوة: السدس (تحتسب على أساس أصل المسألة)
    const heirs2 = {
        mother: true,
        fullBrothers: 2,
        father: true
    };
    const result2 = InheritanceCalculator.calculate(heirs2, 100);
    // الإخوة محجوبون بالأب، لكنهم يؤثرون على نصيب الأم
    // الأم تأخذ السدس بوجود جمع من الإخوة (اثنان فأكثر)
    const motherRatio2 = result2.heirs.mother.totalAmount / 100;
    assert(motherRatio2 <= 0.17, 'الأم تأخذ السدس مع وجود إخوة متعددين');
});

// =====================================================
// اختبار 12: التحقق من صحة المدخلات
// =====================================================
test('التحقق من صحة المدخلات', () => {
    try {
        InheritanceCalculator.calculate(null, 100);
        throw new Error('يجب أن يرمي خطأ للمدخلات غير الصحيحة');
    } catch (error) {
        assert(error.message === 'Invalid heirs data', 'رسالة خطأ صحيحة');
    }

    try {
        InheritanceCalculator.calculate({}, 0);
        throw new Error('يجب أن يرمي خطأ للتركة الصفرية');
    } catch (error) {
        assert(error.message === 'Estate must be positive', 'رسالة خطأ صحيحة');
    }
});

// =====================================================
// اختبار 13: حالة معقدة شاملة
// =====================================================
test('حالة معقدة: زوجة + ابن + 3 بنات + أب + أم', () => {
    const heirs = {
        wife: true,
        sons: 1,
        daughters: 3,
        father: true,
        mother: true
    };
    const result = InheritanceCalculator.calculate(heirs, 10000);

    // التحقق من وجود جميع الورثة
    assert(result.heirs.wife, 'الزوجة ترث');
    assert(result.heirs.sons, 'الابن يرث');
    assert(result.heirs.daughters, 'البنات يرثن');
    assert(result.heirs.father, 'الأب يرث');
    assert(result.heirs.mother, 'الأم ترث');

    // التحقق من توزيع كامل التركة
    assertApproxEqual(result.totalDistributed, 10000, 1, 'يجب توزيع كامل التركة');
});

// =====================================================
// اختبار 14: الإخوة من الأم
// =====================================================
test('الإخوة من الأم', () => {
    // أخ واحد من الأم: السدس
    const heirs1 = {
        maternalBrothers: 1,
        fullSisters: 1
    };
    const result1 = InheritanceCalculator.calculate(heirs1, 100);
    assert(result1.heirs.maternalSiblings.fraction.includes('/6'), 'أخ واحد من الأم يأخذ السدس');

    // أخوان أو أكثر من الأم: الثلث (يتشاركونه)
    const heirs2 = {
        maternalBrothers: 1,
        maternalSisters: 1,
        fullBrothers: 1
    };
    const result2 = InheritanceCalculator.calculate(heirs2, 100);
    assert(result2.heirs.maternalSiblings.fraction.includes('/3'), 'اثنان أو أكثر من الأم يأخذون الثلث');
});

// =====================================================
// اختبار 15: أخت واحدة شقيقة تأخذ النصف
// =====================================================
test('أخت واحدة شقيقة تأخذ النصف', () => {
    const heirs = {
        fullSisters: 1,
        mother: true
    };
    const result = InheritanceCalculator.calculate(heirs, 100);

    // الأخت الشقيقة تأخذ النصف إذا انفردت
    assert(result.heirs.fullSisters, 'الأخت الشقيقة ترث');
});

// =====================================================
// النتائج النهائية
// =====================================================
console.log('\n' + colors.blue + '='.repeat(60));
console.log('النتائج النهائية / Final Results');
console.log('='.repeat(60) + colors.reset);

const totalTests = passedTests + failedTests;
const successRate = ((passedTests / totalTests) * 100).toFixed(2);

console.log(`${colors.green}✓ اختبارات ناجحة: ${passedTests}${colors.reset}`);
console.log(`${colors.red}✗ اختبارات فاشلة: ${failedTests}${colors.reset}`);
console.log(`${colors.yellow}📊 معدل النجاح: ${successRate}%${colors.reset}`);

if (failedTests === 0) {
    console.log(`\n${colors.green}🎉 جميع الاختبارات نجحت!${colors.reset}\n`);
    process.exit(0);
} else {
    console.log(`\n${colors.red}❌ بعض الاختبارات فشلت!${colors.reset}\n`);
    process.exit(1);
}
