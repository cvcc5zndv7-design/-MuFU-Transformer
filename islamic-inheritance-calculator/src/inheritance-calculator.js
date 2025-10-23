/**
 * برنامج حساب المواريث الشرعية الإسلامية
 * Islamic Inheritance Calculator
 *
 * مبني على أحكام القرآن الكريم والسنة النبوية
 * Based on the Quran and Sunnah
 */

class InheritanceCalculator {

  /**
   * الكسور الشرعية المستخدمة في الميراث
   * Islamic fractions used in inheritance
   */
  static FRACTIONS = {
    HALF: { numerator: 1, denominator: 2, name: 'النصف', nameEn: 'Half' },
    QUARTER: { numerator: 1, denominator: 4, name: 'الربع', nameEn: 'Quarter' },
    EIGHTH: { numerator: 1, denominator: 8, name: 'الثمن', nameEn: 'Eighth' },
    TWO_THIRDS: { numerator: 2, denominator: 3, name: 'الثلثان', nameEn: 'Two-Thirds' },
    THIRD: { numerator: 1, denominator: 3, name: 'الثلث', nameEn: 'Third' },
    SIXTH: { numerator: 1, denominator: 6, name: 'السدس', nameEn: 'Sixth' },
    TWO_SIXTHS: { numerator: 2, denominator: 6, name: 'الثلث', nameEn: 'Third' }
  };

  /**
   * حساب المواريث الرئيسي
   * Main inheritance calculation
   *
   * @param {Object} heirs - الورثة
   * @param {number} estate - التركة
   * @returns {Object} - نتيجة التوزيع
   */
  static calculate(heirs, estate = 1) {
    // التحقق من صحة البيانات
    this.validateInput(heirs, estate);

    // تطبيع البيانات
    const normalizedHeirs = this.normalizeHeirs(heirs);

    // تحديد من يرث ومن يُحجب
    const eligibleHeirs = this.applyHijab(normalizedHeirs);

    // حساب الفروض (مع الاحتفاظ بالبيانات الأصلية للأم)
    const shares = this.calculateShares(eligibleHeirs, normalizedHeirs);

    // حساب أصل المسألة
    const commonDenominator = this.findCommonDenominator(shares);

    // تحويل الفروض إلى سهام
    const stockShares = this.convertToStocks(shares, commonDenominator);

    // حساب مجموع السهام
    const totalStocks = this.sumStocks(stockShares);

    // معالجة العول أو الرد
    const adjustedResult = this.applyAwlOrRadd(
      stockShares,
      commonDenominator,
      totalStocks,
      eligibleHeirs
    );

    // حساب القيم النقدية
    const finalDistribution = this.calculateMonetaryValues(
      adjustedResult.shares,
      adjustedResult.denominator,
      estate
    );

    // إنشاء التقرير المفصل
    return this.generateReport(
      normalizedHeirs,
      eligibleHeirs,
      finalDistribution,
      adjustedResult,
      estate
    );
  }

  /**
   * التحقق من صحة المدخلات
   */
  static validateInput(heirs, estate) {
    if (!heirs || typeof heirs !== 'object') {
      throw new Error('Invalid heirs data');
    }
    if (estate <= 0) {
      throw new Error('Estate must be positive');
    }
  }

  /**
   * تطبيع بيانات الورثة
   */
  static normalizeHeirs(heirs) {
    const normalized = {};

    // الورثة من الذكور
    normalized.sons = parseInt(heirs.sons) || 0;
    normalized.father = heirs.father === true || heirs.father === 1;
    normalized.grandfather = heirs.grandfather === true || heirs.grandfather === 1;
    normalized.husband = heirs.husband === true || heirs.husband === 1;
    normalized.fullBrothers = parseInt(heirs.fullBrothers) || 0;
    normalized.paternalBrothers = parseInt(heirs.paternalBrothers) || 0;
    normalized.maternalBrothers = parseInt(heirs.maternalBrothers) || 0;
    normalized.fullSistersSons = parseInt(heirs.fullSistersSons) || 0;
    normalized.paternalUncles = parseInt(heirs.paternalUncles) || 0;

    // الورثة من الإناث
    normalized.daughters = parseInt(heirs.daughters) || 0;
    normalized.mother = heirs.mother === true || heirs.mother === 1;
    normalized.grandmother = heirs.grandmother === true || heirs.grandmother === 1;
    normalized.wife = heirs.wife === true || heirs.wife === 1;
    normalized.fullSisters = parseInt(heirs.fullSisters) || 0;
    normalized.paternalSisters = parseInt(heirs.paternalSisters) || 0;
    normalized.maternalSisters = parseInt(heirs.maternalSisters) || 0;
    normalized.sonsDaughters = parseInt(heirs.sonsDaughters) || 0;

    return normalized;
  }

  /**
   * تطبيق الحجب
   * Apply Hijab (blocking/veiling)
   */
  static applyHijab(heirs) {
    const eligible = { ...heirs };

    // الابن يحجب ابن الابن والإخوة
    if (heirs.sons > 0) {
      eligible.fullBrothers = 0;
      eligible.paternalBrothers = 0;
      eligible.fullSistersSons = 0;
      eligible.paternalUncles = 0;
      eligible.maternalBrothers = 0;
      eligible.maternalSisters = 0;
    }

    // البنات يحجبون الإخوة من الأم
    if (heirs.daughters > 0) {
      eligible.maternalBrothers = 0;
      eligible.maternalSisters = 0;
    }

    // الأب يحجب الجد والإخوة الأشقاء والإخوة لأب (في بعض الحالات)
    if (heirs.father) {
      eligible.grandfather = false;
      // الأب يحجب الإخوة الأشقاء والإخوة لأب فقط، ولا يحجب الإخوة من الأم
      eligible.fullBrothers = 0;
      eligible.paternalBrothers = 0;
      eligible.fullSisters = 0;
      eligible.paternalSisters = 0;
    }

    // الأم الدنيا تحجب الجدة
    if (heirs.mother) {
      eligible.grandmother = false;
    }

    // الابن وابن الابن يحجبون الإخوة الأشقاء والأب
    if (heirs.sons > 0 || heirs.fullSistersSons > 0) {
      // البنت لا ترث مع وجود الابن في العصبة
    }

    return eligible;
  }

  /**
   * حساب الفروض لكل وارث
   */
  static calculateShares(heirs, originalHeirs = null) {
    const shares = {};
    // استخدم البيانات الأصلية إذا كانت متوفرة
    const checkHeirs = originalHeirs || heirs;

    // حساب نصيب الزوج
    if (heirs.husband) {
      if (heirs.sons > 0 || heirs.daughters > 0 || heirs.sonsDaughters > 0) {
        shares.husband = { ...this.FRACTIONS.QUARTER, count: 1 };
      } else {
        shares.husband = { ...this.FRACTIONS.HALF, count: 1 };
      }
    }

    // حساب نصيب الزوجة
    if (heirs.wife) {
      if (heirs.sons > 0 || heirs.daughters > 0 || heirs.sonsDaughters > 0) {
        shares.wife = { ...this.FRACTIONS.EIGHTH, count: 1 };
      } else {
        shares.wife = { ...this.FRACTIONS.QUARTER, count: 1 };
      }
    }

    // حساب نصيب الأب
    if (heirs.father) {
      if (heirs.sons > 0 || heirs.sonsDaughters > 0) {
        shares.father = { ...this.FRACTIONS.SIXTH, count: 1 };
      } else {
        shares.father = { ...this.FRACTIONS.SIXTH, count: 1, asaba: true };
      }
    }

    // حساب نصيب الأم
    if (heirs.mother) {
      const hasChildren = checkHeirs.sons > 0 || checkHeirs.daughters > 0 || checkHeirs.sonsDaughters > 0;
      // الإخوة يؤثرون على نصيب الأم حتى لو كانوا محجوبين
      // يجب أن يكونوا اثنين فأكثر (من جميع الأنواع)
      const totalSiblings = checkHeirs.fullBrothers + checkHeirs.paternalBrothers +
                            checkHeirs.fullSisters + checkHeirs.paternalSisters +
                            checkHeirs.maternalBrothers + checkHeirs.maternalSisters;
      const hasSiblings = totalSiblings >= 2;

      if (hasChildren || hasSiblings) {
        shares.mother = { ...this.FRACTIONS.SIXTH, count: 1 };
      } else {
        shares.mother = { ...this.FRACTIONS.THIRD, count: 1 };
      }
    }

    // حساب نصيب البنات
    if (heirs.daughters > 0) {
      if (heirs.daughters === 1 && heirs.sons === 0) {
        shares.daughters = { ...this.FRACTIONS.HALF, count: 1 };
      } else if (heirs.daughters >= 2 && heirs.sons === 0) {
        shares.daughters = { ...this.FRACTIONS.TWO_THIRDS, count: heirs.daughters };
      } else {
        // البنات مع الأبناء - عصبة بالغير (للذكر مثل حظ الأنثيين)
        shares.daughters = { asaba: true, count: heirs.daughters, withSons: heirs.sons };
      }
    }

    // حساب نصيب الأبناء
    if (heirs.sons > 0) {
      if (heirs.daughters > 0) {
        shares.sons = { asaba: true, count: heirs.sons, withDaughters: heirs.daughters };
      } else {
        shares.sons = { asaba: true, count: heirs.sons };
      }
    }

    // حساب نصيب الإخوة الأشقاء
    if (heirs.fullBrothers > 0) {
      shares.fullBrothers = { asaba: true, count: heirs.fullBrothers };
    }

    // حساب نصيب الأخوات الشقيقات
    if (heirs.fullSisters > 0) {
      if (heirs.fullSisters === 1 && heirs.fullBrothers === 0 && heirs.sons === 0) {
        shares.fullSisters = { ...this.FRACTIONS.HALF, count: 1 };
      } else if (heirs.fullSisters >= 2 && heirs.fullBrothers === 0 && heirs.sons === 0) {
        shares.fullSisters = { ...this.FRACTIONS.TWO_THIRDS, count: heirs.fullSisters };
      } else if (heirs.fullBrothers > 0) {
        shares.fullSisters = { asaba: true, count: heirs.fullSisters, withBrothers: heirs.fullBrothers };
      }
    }

    // حساب نصيب الإخوة من الأم
    const maternalTotal = heirs.maternalBrothers + heirs.maternalSisters;
    if (maternalTotal > 0) {
      // التحقق من عدم وجود فرع وارث أو أصل وارث ذكر
      const hasBlockingHeir = heirs.sons > 0 || heirs.daughters > 0 || heirs.father;

      if (!hasBlockingHeir) {
        if (maternalTotal === 1) {
          shares.maternalSiblings = { ...this.FRACTIONS.SIXTH, count: maternalTotal };
        } else {
          shares.maternalSiblings = { ...this.FRACTIONS.THIRD, count: maternalTotal };
        }
      }
    }

    // حساب نصيب الجدة
    if (heirs.grandmother) {
      shares.grandmother = { ...this.FRACTIONS.SIXTH, count: 1 };
    }

    return shares;
  }

  /**
   * إيجاد المقام المشترك (أصل المسألة)
   */
  static findCommonDenominator(shares) {
    const denominators = [];

    for (const heir in shares) {
      if (shares[heir].denominator && !shares[heir].asaba) {
        denominators.push(shares[heir].denominator);
      }
    }

    if (denominators.length === 0) return 1;

    // إيجاد المضاعف المشترك الأصغر
    return this.lcm(denominators);
  }

  /**
   * المضاعف المشترك الأصغر
   */
  static lcm(numbers) {
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const lcm2 = (a, b) => (a * b) / gcd(a, b);

    return numbers.reduce(lcm2);
  }

  /**
   * تحويل الفروض إلى سهام
   */
  static convertToStocks(shares, denominator) {
    const stocks = {};

    for (const heir in shares) {
      if (!shares[heir].asaba) {
        const numerator = shares[heir].numerator;
        const den = shares[heir].denominator;
        stocks[heir] = {
          stocks: (numerator * denominator) / den,
          count: shares[heir].count,
          fraction: shares[heir]
        };
      } else {
        stocks[heir] = {
          asaba: true,
          count: shares[heir].count,
          withSons: shares[heir].withSons,
          withDaughters: shares[heir].withDaughters,
          withBrothers: shares[heir].withBrothers
        };
      }
    }

    return stocks;
  }

  /**
   * حساب مجموع السهام
   */
  static sumStocks(stockShares) {
    let total = 0;

    for (const heir in stockShares) {
      if (!stockShares[heir].asaba) {
        total += stockShares[heir].stocks;
      }
    }

    return total;
  }

  /**
   * معالجة العول أو الرد
   */
  static applyAwlOrRadd(stockShares, denominator, totalStocks, heirs) {
    const hasAsaba = Object.values(stockShares).some(s => s.asaba);

    if (totalStocks > denominator) {
      // حالة العول (زيادة السهام)
      return {
        type: 'awl',
        denominator: totalStocks,
        shares: stockShares,
        originalDenominator: denominator
      };
    } else if (totalStocks < denominator && !hasAsaba) {
      // حالة الرد (نقص السهام وعدم وجود عصبة)
      // في حالة الرد، نرد الباقي على أصحاب الفروض (عدا الزوجين)
      const remaining = denominator - totalStocks;

      // الزوجان لا يُرد عليهم
      const eligibleForRadd = {};
      for (const heir in stockShares) {
        if (!stockShares[heir].asaba && heir !== 'husband' && heir !== 'wife') {
          eligibleForRadd[heir] = stockShares[heir];
        }
      }

      // حساب مجموع سهام من يُرد عليهم
      let raddTotal = 0;
      for (const heir in eligibleForRadd) {
        raddTotal += eligibleForRadd[heir].stocks;
      }

      // توزيع الباقي بنسبة فروضهم
      if (raddTotal > 0) {
        for (const heir in eligibleForRadd) {
          const ratio = eligibleForRadd[heir].stocks / raddTotal;
          stockShares[heir].stocks += remaining * ratio;
        }
      }

      return {
        type: 'radd',
        denominator: denominator,
        shares: stockShares,
        originalDenominator: denominator
      };
    } else {
      // الحالة العادية أو وجود عصبة
      const remaining = denominator - totalStocks;

      if (remaining > 0 && hasAsaba) {
        // توزيع الباقي على العصبة
        this.distributeToAsaba(stockShares, remaining);
      }

      return {
        type: 'normal',
        denominator: denominator,
        shares: stockShares,
        originalDenominator: denominator
      };
    }
  }

  /**
   * توزيع الباقي على العصبة
   */
  static distributeToAsaba(stockShares, remaining) {
    // حساب مجموع وحدات العصبة (للذكر مثل حظ الأنثيين)
    let totalUnits = 0;

    for (const heir in stockShares) {
      if (stockShares[heir].asaba) {
        const share = stockShares[heir];
        if (heir === 'sons' || heir === 'fullBrothers') {
          totalUnits += share.count * 2; // الذكر
        } else if (heir === 'daughters' || heir === 'fullSisters') {
          totalUnits += share.count; // الأنثى
        } else {
          totalUnits += share.count;
        }
      }
    }

    // توزيع السهام
    for (const heir in stockShares) {
      if (stockShares[heir].asaba) {
        const share = stockShares[heir];
        let units;

        if (heir === 'sons' || heir === 'fullBrothers') {
          units = share.count * 2;
        } else if (heir === 'daughters' || heir === 'fullSisters') {
          units = share.count;
        } else {
          units = share.count;
        }

        stockShares[heir].stocks = (remaining * units) / totalUnits;
      }
    }
  }

  /**
   * حساب القيم النقدية
   */
  static calculateMonetaryValues(shares, denominator, estate) {
    const distribution = {};

    for (const heir in shares) {
      const share = shares[heir];
      const stocks = share.stocks || 0;
      const count = share.count || 1;

      if (stocks > 0) {
        const totalAmount = (stocks / denominator) * estate;
        const perPerson = count > 1 ? totalAmount / count : totalAmount;

        distribution[heir] = {
          totalAmount: totalAmount,
          perPerson: perPerson,
          count: count,
          stocks: stocks,
          fraction: stocks + '/' + denominator
        };
      }
    }

    return distribution;
  }

  /**
   * إنشاء التقرير المفصل
   */
  static generateReport(originalHeirs, eligibleHeirs, distribution, adjustedResult, estate) {
    const blocked = this.findBlockedHeirs(originalHeirs, eligibleHeirs);

    return {
      estate: estate,
      totalDistributed: Object.values(distribution).reduce((sum, h) => sum + h.totalAmount, 0),
      denominator: adjustedResult.denominator,
      originalDenominator: adjustedResult.originalDenominator,
      type: adjustedResult.type,
      heirs: distribution,
      blockedHeirs: blocked,
      summary: this.generateSummary(distribution, adjustedResult, estate, blocked)
    };
  }

  /**
   * إيجاد الورثة المحجوبين
   */
  static findBlockedHeirs(original, eligible) {
    const blocked = [];

    for (const heir in original) {
      if (original[heir] && !eligible[heir]) {
        blocked.push(heir);
      } else if (original[heir] > eligible[heir]) {
        blocked.push(heir + ' (partial)');
      }
    }

    return blocked;
  }

  /**
   * إنشاء ملخص التقرير
   */
  static generateSummary(distribution, adjustedResult, estate, blocked) {
    let summary = `التركة الإجمالية: ${estate}\n`;
    summary += `أصل المسألة: ${adjustedResult.originalDenominator}\n`;

    if (adjustedResult.type === 'awl') {
      summary += `نوع المسألة: عول (${adjustedResult.denominator})\n`;
    } else if (adjustedResult.type === 'radd') {
      summary += `نوع المسألة: رد (${adjustedResult.denominator})\n`;
    } else {
      summary += `نوع المسألة: عادية\n`;
    }

    summary += `\nتوزيع التركة:\n`;
    summary += `${'='.repeat(50)}\n`;

    for (const heir in distribution) {
      const h = distribution[heir];
      const heirName = this.getHeirName(heir);
      summary += `${heirName}: ${h.totalAmount.toFixed(2)} (${h.fraction})`;
      if (h.count > 1) {
        summary += ` - ${h.count} أشخاص × ${h.perPerson.toFixed(2)}`;
      }
      summary += `\n`;
    }

    if (blocked.length > 0) {
      summary += `\nالورثة المحجوبون:\n`;
      blocked.forEach(b => {
        summary += `- ${this.getHeirName(b)}\n`;
      });
    }

    return summary;
  }

  /**
   * الحصول على اسم الوارث بالعربية
   */
  static getHeirName(heir) {
    const names = {
      husband: 'الزوج',
      wife: 'الزوجة',
      father: 'الأب',
      mother: 'الأم',
      sons: 'الأبناء',
      daughters: 'البنات',
      grandfather: 'الجد',
      grandmother: 'الجدة',
      fullBrothers: 'الإخوة الأشقاء',
      fullSisters: 'الأخوات الشقيقات',
      paternalBrothers: 'الإخوة لأب',
      paternalSisters: 'الأخوات لأب',
      maternalSiblings: 'الإخوة والأخوات لأم',
      sonsDaughters: 'بنات الابن',
      fullSistersSons: 'أبناء الأخ الشقيق',
      paternalUncles: 'الأعمام'
    };

    return names[heir] || heir;
  }
}

// للاستخدام في Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InheritanceCalculator;
}
