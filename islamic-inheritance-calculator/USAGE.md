# دليل الاستخدام - Usage Guide

## طريقة الاستخدام السريع / Quick Start

### 1. واجهة الويب / Web Interface

افتح الملف `public/index.html` مباشرة في المتصفح:

```bash
cd islamic-inheritance-calculator/public
# ثم افتح index.html في متصفحك المفضل
```

### 2. واجهة سطر الأوامر / CLI

```bash
cd islamic-inheritance-calculator
node src/cli.js
```

### 3. استخدام المكتبة / Library Usage

```javascript
const InheritanceCalculator = require('./src/inheritance-calculator');

// مثال: زوجة + بنتان + أب + أم
const heirs = {
  wife: true,
  daughters: 2,
  father: true,
  mother: true
};

const estate = 120000; // التركة بالريال

const result = InheritanceCalculator.calculate(heirs, estate);

console.log('نتيجة التوزيع:');
console.log(result.summary);
```

## أمثلة تفصيلية / Detailed Examples

### المثال 1: ورثة بسيطون

```javascript
// حالة: زوجة + 3 أبناء
const heirs = {
  wife: true,
  sons: 3
};

const result = InheritanceCalculator.calculate(heirs, 100000);
// الزوجة: الثمن (12,500)
// الأبناء: الباقي يُقسم بينهم بالتساوي (29,166.67 لكل ابن)
```

### المثال 2: للذكر مثل حظ الأنثيين

```javascript
// حالة: ابن + بنت
const heirs = {
  sons: 1,
  daughters: 1
};

const result = InheritanceCalculator.calculate(heirs, 300000);
// الابن: 200,000 (الثلثان)
// البنت: 100,000 (الثلث)
```

### المثال 3: حالة العول

```javascript
// حالة: زوج + أختان شقيقتان + أم
const heirs = {
  husband: true,
  fullSisters: 2,
  mother: true
};

const result = InheritanceCalculator.calculate(heirs, 27000);
// هذه حالة عول (المجموع أكبر من الأصل)
// result.type === 'awl'
```

### المثال 4: حالة الرد

```javascript
// حالة: بنتان فقط
const heirs = {
  daughters: 2
};

const result = InheritanceCalculator.calculate(heirs, 100000);
// البنتان تأخذان الثلثين فرضاً
// والباقي يُرد عليهما
// result.type === 'radd'
```

### المثال 5: حالة الحجب

```javascript
// حالة: ابن + إخوة (الإخوة محجوبون)
const heirs = {
  sons: 1,
  fullBrothers: 2
};

const result = InheritanceCalculator.calculate(heirs, 100000);
// الإخوة محجوبون بوجود الابن
// result.blockedHeirs.includes('fullBrothers') === true
```

### المثال 6: حالة معقدة

```javascript
// حالة: زوجة + ابن + 3 بنات + أب + أم
const heirs = {
  wife: true,
  sons: 1,
  daughters: 3,
  father: true,
  mother: true
};

const result = InheritanceCalculator.calculate(heirs, 1000000);

// توزيع شامل لجميع الورثة:
// - الزوجة: الثمن
// - الأب: السدس
// - الأم: السدس
// - الابن والبنات: الباقي (للذكر مثل حظ الأنثيين)
```

## تفاصيل كائن النتيجة / Result Object Details

```javascript
{
  estate: 100000,                    // التركة الأصلية
  totalDistributed: 100000,          // المبلغ الموزع
  denominator: 24,                   // أصل المسألة النهائي
  originalDenominator: 24,           // أصل المسألة الأصلي
  type: 'normal',                    // نوع المسألة (normal/awl/radd)

  heirs: {
    wife: {
      totalAmount: 12500,            // النصيب الإجمالي
      perPerson: 12500,              // نصيب الفرد
      count: 1,                      // عدد الأشخاص
      stocks: 3,                     // عدد السهام
      fraction: '3/24'               // الكسر
    },
    // ... باقي الورثة
  },

  blockedHeirs: [],                  // قائمة الورثة المحجوبين

  summary: "نص مفصل عن التوزيع"    // التقرير التفصيلي
}
```

## الورثة المدعومون / Supported Heirs

### الزوجان / Spouses
- `husband`: الزوج
- `wife`: الزوجة

### الوالدان والأجداد / Parents & Grandparents
- `father`: الأب
- `mother`: الأم
- `grandfather`: الجد
- `grandmother`: الجدة

### الأولاد / Children
- `sons`: عدد الأبناء
- `daughters`: عدد البنات
- `sonsDaughters`: عدد بنات الابن

### الإخوة والأخوات / Siblings
- `fullBrothers`: الإخوة الأشقاء
- `fullSisters`: الأخوات الشقيقات
- `paternalBrothers`: الإخوة لأب
- `paternalSisters`: الأخوات لأب
- `maternalBrothers`: الإخوة لأم
- `maternalSisters`: الأخوات لأم

## الأحكام الشرعية المطبقة / Applied Islamic Rules

### الفروض / Fixed Shares
- النصف (1/2): للزوج، البنت الواحدة، الأخت الشقيقة الواحدة
- الربع (1/4): للزوج والزوجة في بعض الحالات
- الثمن (1/8): للزوجة مع فرع وارث
- الثلثان (2/3): للبنتين فأكثر، للأختين الشقيقتين فأكثر
- الثلث (1/3): للأم في بعض الحالات، للإخوة من الأم
- السدس (1/6): للأب والأم والجدة في بعض الحالات

### العصبة / Residuary
- للذكر مثل حظ الأنثيين
- الأبناء والبنات
- الأب مع عدم وجود فرع وارث
- الإخوة الأشقاء والأخوات الشقيقات

### الحجب / Blocking
- الابن يحجب الإخوة
- الأب يحجب الجد والإخوة الأشقاء
- الأم تحجب الجدة
- الفرع الوارث يحجب الإخوة من الأم

### العول / Awl
- عندما يزيد مجموع الفروض عن أصل المسألة
- يُزاد المقام حتى يساوي مجموع الفروض

### الرد / Radd
- عندما ينقص مجموع الفروض عن أصل المسألة
- يُرد الباقي على أصحاب الفروض (عدا الزوجين)

## اختبار البرنامج / Testing

تشغيل الاختبارات الشاملة:

```bash
cd islamic-inheritance-calculator
npm test
```

معدل نجاح الاختبارات: **100%** (15/15 اختباراً)

## ملاحظات مهمة / Important Notes

1. **للاسترشاد فقط**: هذا البرنامج للاسترشاد. يُنصح بمراجعة عالم شرعي متخصص للحالات المعقدة.

2. **الدقة**: البرنامج يطبق الأحكام الأساسية للمواريث، لكن قد توجد حالات خاصة تحتاج لفتوى شرعية.

3. **التطوير المستمر**: البرنامج قابل للتحسين والتطوير. المساهمات مرحب بها!

4. **اللغة**: البرنامج يدعم العربية والإنجليزية في الواجهة والمخرجات.

## الدعم / Support

لأي استفسارات أو مشاكل:
- افتح Issue على GitHub
- راجع الوثائق في README.md
- تحقق من أمثلة الاختبارات في `tests/test-runner.js`

## المراجع الشرعية / Islamic References

- **القرآن الكريم**: سورة النساء (آيات 11، 12، 176)
- **كتب الفرائض**: المراجع الفقهية المعتمدة
- **الإجماع**: ما أجمع عليه العلماء من أحكام المواريث

---

والله أعلم، وصلى الله على نبينا محمد وعلى آله وصحبه وسلم
