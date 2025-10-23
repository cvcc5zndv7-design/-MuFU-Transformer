#!/usr/bin/env node

/**
 * واجهة سطر الأوامر لحاسبة المواريث الإسلامية
 * CLI Interface for Islamic Inheritance Calculator
 */

const InheritanceCalculator = require('./inheritance-calculator');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// ألوان للطباعة
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

/**
 * طرح سؤال
 */
function question(prompt) {
    return new Promise(resolve => {
        rl.question(prompt, resolve);
    });
}

/**
 * طباعة العنوان
 */
function printHeader() {
    console.clear();
    console.log(colors.blue + colors.bright);
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║      برنامج حساب المواريث الشرعية الإسلامية              ║');
    console.log('║      Islamic Inheritance Calculator                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(colors.reset);
    console.log();
}

/**
 * طباعة القائمة
 */
function printMenu() {
    console.log(colors.cyan + 'اختر خياراً:' + colors.reset);
    console.log('1. حساب مواريث جديدة');
    console.log('2. عرض مثال توضيحي');
    console.log('3. معلومات عن البرنامج');
    console.log('4. خروج');
    console.log();
}

/**
 * جمع بيانات الورثة
 */
async function collectHeirsData() {
    const heirs = {};

    console.log(colors.yellow + '\nأدخل بيانات الورثة:' + colors.reset);
    console.log('(للإجابة بنعم: y أو 1، للإجابة بلا: n أو 0)\n');

    // الزوجان
    console.log(colors.green + '--- الزوجان ---' + colors.reset);
    heirs.husband = await askYesNo('هل يوجد زوج؟');
    heirs.wife = await askYesNo('هل توجد زوجة؟');

    // الوالدان
    console.log(colors.green + '\n--- الوالدان والأجداد ---' + colors.reset);
    heirs.father = await askYesNo('هل يوجد أب؟');
    heirs.mother = await askYesNo('هل توجد أم؟');
    heirs.grandfather = await askYesNo('هل يوجد جد؟');
    heirs.grandmother = await askYesNo('هل توجد جدة؟');

    // الأولاد
    console.log(colors.green + '\n--- الأولاد ---' + colors.reset);
    heirs.sons = await askNumber('عدد الأبناء:');
    heirs.daughters = await askNumber('عدد البنات:');
    heirs.sonsDaughters = await askNumber('عدد بنات الابن:');

    // الإخوة
    console.log(colors.green + '\n--- الإخوة والأخوات ---' + colors.reset);
    heirs.fullBrothers = await askNumber('عدد الإخوة الأشقاء:');
    heirs.fullSisters = await askNumber('عدد الأخوات الشقيقات:');
    heirs.paternalBrothers = await askNumber('عدد الإخوة لأب:');
    heirs.paternalSisters = await askNumber('عدد الأخوات لأب:');
    heirs.maternalBrothers = await askNumber('عدد الإخوة لأم:');
    heirs.maternalSisters = await askNumber('عدد الأخوات لأم:');

    return heirs;
}

/**
 * سؤال نعم/لا
 */
async function askYesNo(prompt) {
    const answer = await question(`  ${prompt} (y/n): `);
    return answer.toLowerCase() === 'y' || answer === '1';
}

/**
 * سؤال رقم
 */
async function askNumber(prompt) {
    const answer = await question(`  ${prompt} `);
    return parseInt(answer) || 0;
}

/**
 * حساب المواريث
 */
async function calculateInheritance() {
    console.log();
    const heirs = await collectHeirsData();

    console.log();
    const estate = parseFloat(await question(colors.yellow + 'قيمة التركة: ' + colors.reset));

    if (estate <= 0) {
        console.log(colors.red + '⚠️  قيمة التركة يجب أن تكون أكبر من الصفر' + colors.reset);
        return;
    }

    try {
        const result = InheritanceCalculator.calculate(heirs, estate);
        displayResults(result);
    } catch (error) {
        console.log(colors.red + `⚠️  خطأ: ${error.message}` + colors.reset);
    }
}

/**
 * عرض النتائج
 */
function displayResults(result) {
    console.log('\n' + colors.blue + colors.bright);
    console.log('═'.repeat(70));
    console.log('                         نتائج التوزيع');
    console.log('═'.repeat(70));
    console.log(colors.reset);

    // المعلومات العامة
    console.log(colors.cyan + '\nمعلومات عامة:' + colors.reset);
    console.log(`  التركة الإجمالية: ${formatCurrency(result.estate)}`);
    console.log(`  المبلغ الموزع: ${formatCurrency(result.totalDistributed)}`);
    console.log(`  أصل المسألة: ${result.originalDenominator}`);

    let caseType = 'عادية';
    if (result.type === 'awl') {
        caseType = `عول (${result.denominator})`;
    } else if (result.type === 'radd') {
        caseType = `رد (${result.denominator})`;
    }
    console.log(`  نوع المسألة: ${caseType}`);

    // توزيع الأنصبة
    console.log(colors.cyan + '\nتوزيع الأنصبة:' + colors.reset);
    console.log('─'.repeat(70));

    for (const heir in result.heirs) {
        const h = result.heirs[heir];
        const heirName = InheritanceCalculator.getHeirName(heir);

        console.log(colors.green + `\n${heirName}:` + colors.reset);
        console.log(`  الكسر: ${h.fraction}`);
        console.log(`  النصيب الإجمالي: ${formatCurrency(h.totalAmount)}`);

        if (h.count > 1) {
            console.log(`  عدد الأشخاص: ${h.count}`);
            console.log(`  نصيب الفرد: ${formatCurrency(h.perPerson)}`);
        }
    }

    // الورثة المحجوبون
    if (result.blockedHeirs && result.blockedHeirs.length > 0) {
        console.log(colors.yellow + '\nالورثة المحجوبون:' + colors.reset);
        result.blockedHeirs.forEach(heir => {
            console.log(`  • ${InheritanceCalculator.getHeirName(heir)}`);
        });
    }

    console.log('\n' + colors.blue + '═'.repeat(70) + colors.reset);
}

/**
 * تنسيق العملة
 */
function formatCurrency(amount) {
    return amount.toLocaleString('ar-SA', {
        style: 'currency',
        currency: 'SAR',
        minimumFractionDigits: 2
    });
}

/**
 * عرض مثال توضيحي
 */
function showExample() {
    console.log(colors.yellow + '\nمثال توضيحي: زوجة + بنتان + أب + أم' + colors.reset);
    console.log('التركة: 120,000 ريال\n');

    const heirs = {
        wife: true,
        daughters: 2,
        father: true,
        mother: true
    };

    const result = InheritanceCalculator.calculate(heirs, 120000);
    displayResults(result);
}

/**
 * عرض معلومات البرنامج
 */
function showInfo() {
    console.log(colors.blue + '\nمعلومات البرنامج:' + colors.reset);
    console.log('─'.repeat(60));
    console.log('الاسم: برنامج حساب المواريث الشرعية الإسلامية');
    console.log('النسخة: 1.0.0');
    console.log('الترخيص: MIT');
    console.log('\nالمميزات:');
    console.log('  ✓ حساب الأنصبة لجميع الورثة');
    console.log('  ✓ معالجة الحجب (الكامل والجزئي)');
    console.log('  ✓ معالجة العصبة');
    console.log('  ✓ معالجة العول والرد');
    console.log('  ✓ تقرير مفصل بالتوزيع');
    console.log('\nالأساس الشرعي:');
    console.log('  • سورة النساء - آيات 11، 12، 176');
    console.log('  • أحكام المواريث من الفقه الإسلامي');
    console.log('\nتنويه:');
    console.log('  هذا البرنامج للاسترشاد فقط.');
    console.log('  يُنصح بمراجعة عالم شرعي متخصص للحالات المعقدة.');
    console.log('─'.repeat(60));
}

/**
 * البرنامج الرئيسي
 */
async function main() {
    printHeader();

    let running = true;

    while (running) {
        printMenu();
        const choice = await question('اختيارك: ');

        switch (choice) {
            case '1':
                await calculateInheritance();
                break;
            case '2':
                showExample();
                break;
            case '3':
                showInfo();
                break;
            case '4':
                console.log(colors.green + '\nشكراً لاستخدامك البرنامج. والسلام عليكم ورحمة الله وبركاته.' + colors.reset);
                running = false;
                break;
            default:
                console.log(colors.red + 'خيار غير صحيح!' + colors.reset);
        }

        if (running) {
            await question('\nاضغط Enter للمتابعة...');
            printHeader();
        }
    }

    rl.close();
}

// تشغيل البرنامج
if (require.main === module) {
    main().catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
}
