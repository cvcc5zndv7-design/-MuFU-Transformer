/**
 * واجهة التطبيق - Application Interface
 */

/**
 * حساب المواريث وعرض النتائج
 */
function calculateInheritance() {
    try {
        // جمع البيانات من النموذج
        const heirs = collectHeirsData();
        const estate = parseFloat(document.getElementById('estate').value) || 0;

        // التحقق من صحة البيانات
        if (estate <= 0) {
            alert('الرجاء إدخال قيمة التركة');
            return;
        }

        // التحقق من وجود ورثة
        const hasHeirs = Object.values(heirs).some(v => v > 0 || v === true);
        if (!hasHeirs) {
            alert('الرجاء إدخال بيانات الورثة');
            return;
        }

        // حساب المواريث
        const result = InheritanceCalculator.calculate(heirs, estate);

        // عرض النتائج
        displayResults(result);

        // التمرير إلى النتائج
        document.getElementById('results').scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('خطأ في الحساب:', error);
        alert('حدث خطأ في الحساب: ' + error.message);
    }
}

/**
 * جمع بيانات الورثة من النموذج
 */
function collectHeirsData() {
    const heirs = {};

    // قراءة مربعات الاختيار
    const checkboxes = ['husband', 'wife', 'father', 'mother', 'grandfather', 'grandmother'];
    checkboxes.forEach(id => {
        heirs[id] = document.getElementById(id).checked;
    });

    // قراءة حقول الأعداد
    const numberFields = [
        'sons', 'daughters', 'sonsDaughters',
        'fullBrothers', 'fullSisters',
        'paternalBrothers', 'paternalSisters',
        'maternalBrothers', 'maternalSisters'
    ];
    numberFields.forEach(id => {
        heirs[id] = parseInt(document.getElementById(id).value) || 0;
    });

    return heirs;
}

/**
 * عرض النتائج
 */
function displayResults(result) {
    // إظهار قسم النتائج
    document.getElementById('results').style.display = 'block';

    // عرض المعلومات العامة
    document.getElementById('totalEstate').textContent = formatCurrency(result.estate);
    document.getElementById('totalDistributed').textContent = formatCurrency(result.totalDistributed);
    document.getElementById('denominator').textContent = result.denominator;

    // نوع المسألة
    let caseTypeText = 'عادية';
    if (result.type === 'awl') {
        caseTypeText = `عول (${result.denominator})`;
    } else if (result.type === 'radd') {
        caseTypeText = `رد (${result.denominator})`;
    }
    document.getElementById('caseType').textContent = caseTypeText;

    // جدول التوزيع
    displayDistributionTable(result.heirs);

    // الورثة المحجوبون
    displayBlockedHeirs(result.blockedHeirs);

    // التقرير التفصيلي
    document.getElementById('detailedReport').textContent = result.summary;
}

/**
 * عرض جدول التوزيع
 */
function displayDistributionTable(heirs) {
    const tbody = document.getElementById('distributionBody');
    tbody.innerHTML = '';

    for (const heir in heirs) {
        const h = heirs[heir];
        const row = tbody.insertRow();

        // اسم الوارث
        const cellName = row.insertCell();
        cellName.textContent = InheritanceCalculator.getHeirName(heir);
        cellName.style.fontWeight = 'bold';

        // الكسر
        const cellFraction = row.insertCell();
        cellFraction.textContent = h.fraction;

        // النصيب الإجمالي
        const cellTotal = row.insertCell();
        cellTotal.textContent = formatCurrency(h.totalAmount);
        cellTotal.style.fontWeight = 'bold';
        cellTotal.style.color = '#27ae60';

        // عدد الأشخاص
        const cellCount = row.insertCell();
        cellCount.textContent = h.count;

        // نصيب الفرد
        const cellPerPerson = row.insertCell();
        cellPerPerson.textContent = formatCurrency(h.perPerson);
    }
}

/**
 * عرض الورثة المحجوبون
 */
function displayBlockedHeirs(blocked) {
    const section = document.getElementById('blockedSection');
    const list = document.getElementById('blockedList');

    if (blocked && blocked.length > 0) {
        section.style.display = 'block';
        list.innerHTML = '';

        blocked.forEach(heir => {
            const li = document.createElement('li');
            li.textContent = InheritanceCalculator.getHeirName(heir);
            list.appendChild(li);
        });
    } else {
        section.style.display = 'none';
    }
}

/**
 * تنسيق العملة
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * إعادة تعيين النموذج
 */
function resetForm() {
    // إعادة تعيين جميع الحقول
    document.getElementById('estate').value = '100000';

    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);

    const numbers = document.querySelectorAll('input[type="number"]:not(#estate)');
    numbers.forEach(n => n.value = '0');

    // إخفاء النتائج
    document.getElementById('results').style.display = 'none';
}

/**
 * تحميل مثال توضيحي
 */
function loadExample() {
    // مثال: زوجة + بنتان + أب + أم
    document.getElementById('estate').value = '120000';
    document.getElementById('wife').checked = true;
    document.getElementById('daughters').value = '2';
    document.getElementById('father').checked = true;
    document.getElementById('mother').checked = true;

    // حساب المواريث
    calculateInheritance();
}

/**
 * طباعة التقرير
 */
function printReport() {
    window.print();
}

/**
 * تصدير PDF
 */
function exportPDF() {
    // في بيئة حقيقية، يمكن استخدام مكتبة مثل jsPDF
    alert('ميزة تصدير PDF ستكون متاحة قريباً.\nيمكنك حالياً استخدام وظيفة الطباعة (Ctrl+P) ثم حفظ كـ PDF');
}

/**
 * مشاركة النتائج
 */
function shareResults() {
    const summary = document.getElementById('detailedReport').textContent;

    if (navigator.share) {
        navigator.share({
            title: 'نتائج حساب المواريث',
            text: summary
        }).catch(err => console.log('خطأ في المشاركة:', err));
    } else {
        // نسخ إلى الحافظة
        navigator.clipboard.writeText(summary).then(() => {
            alert('تم نسخ التقرير إلى الحافظة');
        }).catch(err => {
            console.error('خطأ في النسخ:', err);
            alert('حدث خطأ في نسخ التقرير');
        });
    }
}

// تحميل مثال عند فتح الصفحة للمرة الأولى
window.addEventListener('load', () => {
    console.log('برنامج حساب المواريث الشرعية جاهز');
});
