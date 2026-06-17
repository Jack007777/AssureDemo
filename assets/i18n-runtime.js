const WC_I18N_STORAGE_KEY = "wc-lang";
const WC_DEFAULT_LANG = "zh-CN";
const WC_SUPPORTED_LANGS = ["zh-CN", "en-US"];
const WC_MODEL_DIAG_ID = "wc-model-diagnostic";

const WC_TEXT = {
  "zh-CN": {
    title: "轮椅配置器",
    map: {
      "Wheelchair Configurator": "轮椅配置器",
      "Rollstuhlkonfigurator": "轮椅配置器",
      "中文": "中文",
      "English": "English",
      "Deutsch": "Deutsch",
      "登录": "登录",
      "Log In": "登录",
      "Anmelden": "登录",
      "轮椅系列": "轮椅系列",
      "Wheelchair Series": "轮椅系列",
      "Modellreihe": "轮椅系列",
      "3D Preview": "3D 预览",
      "3D-Vorschau": "3D 预览",
      "Categories": "分类目录",
      "Kategorien": "分类目录",
      "Rahmen": "车架",
      "Sitzbespannung": "座椅布面",
      "Rücken": "靠背",
      "Seitenteile und Armstützen": "侧板和扶手",
      "Fußbrett": "脚踏板",
      "Lenkräder": "前轮",
      "Antriebsräder": "后轮",
      "Bremse": "刹车",
      "F55 / Zubehör Rahmen": "F55 / 车架附件",
      "配置": "配置",
      "Configuration": "配置",
      "Konfiguration": "配置",
      "切换选项会实时校验规则并更新价格": "切换选项会实时校验规则并更新价格",
      "Switching options validates rules and updates pricing in real time": "切换选项会实时校验规则并更新价格",
      "Beim Wechseln von Optionen werden Regeln geprüft und Preise sofort aktualisiert": "切换选项会实时校验规则并更新价格",
      "Retail": "Retail",
      "Dealer -10%": "Dealer -10%",
      "Frame": "车架",
      "Frame Color": "车架颜色",
      "Front Angle": "前叉角度",
      "Frame Length": "车架长度",
      "Lateral Frame Setting": "侧架设置",
      "Rear Wheels Bar": "后轮横杆",
      "Seat Width (SW)": "车架宽度 / 座宽 (SW)",
      "Seat Depth (SD)": "座深 (SD)",
      "Backrest Height (BH)": "靠背高度 (BH)",
      "Leg Length (LL)": "腿长 (LL)",
      "Backrest Tube": "靠背管",
      "Backrest Handles": "靠背把手",
      "Seat Setting": "座椅设置",
      "Footrest Setting": "脚踏板设置",
      "Front Wheel Setting": "前轮设置",
      "Front Forks Setting": "前叉设置",
      "Rear Wheels Setting": "后轮设置",
      "Handrim Setting": "扶手圈设置",
      "Tyre Setting": "轮胎设置",
      "Brake Setting": "刹车设置",
      "Axles Setting": "车轴设置",
      "Accessories - Anti Tipp": "附件 - 防后翻",
      "Accessories - Anti Tip": "附件 - 防后翻",
      "Accessories - Tipping Help": "附件 - 倾倒辅助",
      "Accessories - Transit Wheels": "附件 - 转运轮",
      "Skirt Guards": "侧护板",
      "请选择…": "请选择…",
      "请选择...": "请选择…",
      "Please select…": "请选择…",
      "Bitte wählen…": "请选择…",
      "Aluminium": "铝合金",
      "Magnesium": "镁合金",
      "Red": "红色",
      "Green": "绿色",
      "Yellow": "黄色",
      "Blue": "蓝色",
      "100° front angle": "100° 前叉角度",
      "90° front angle": "90° 前叉角度",
      "Std length": "标准长度",
      "Long length": "加长长度",
      "Std lateral frame carbon": "标准碳纤侧架",
      "Extended length lateral frame carbon": "加长碳纤侧架",
      "Carbon fiber 0° camber": "碳纤维 0° 外倾角",
      "Carbon fiber 2° camber": "碳纤维 2° 外倾角",
      "Carbon fiber 4° camber": "碳纤维 4° 外倾角",
      "No skirt guards": "无侧护板",
      "Plastic black straight": "黑色直板塑料侧护板",
      "Carbon fiber straight": "直板碳纤侧护板",
      "Plastic black with mudguard": "带挡泥板的黑色塑料侧护板",
      "Carbon fiber with mudguard": "带挡泥板的碳纤侧护板",
      "STD tube backrest (BH 30-40)": "标准管靠背 (BH 30-40)",
      "LONG tube backrest (BH 37-47)": "长管靠背 (BH 37-47)",
      "STD bended backrest handles": "标准弯折靠背把手",
      "Folding backrest handles": "可折叠靠背把手",
      "STD seat with underseat pouch": "标准座椅带座下袋",
      "Rigid carbon fiber plate": "硬质碳纤座板",
      "Crossed band seat": "交叉带座椅",
      "Plastic plate": "塑料踏板",
      "Carbon fiber plate": "碳纤踏板",
      "Magnesium aluminium plate": "镁铝踏板",
      "No plate (only frame)": "无踏板（仅框架）",
      '3" solid': '3" 实心轮',
      '3" alu rim': '3" 铝圈轮',
      '4" plastic rim': '4" 塑料圈轮',
      '4" alu rim': '4" 铝圈轮',
      '5" plastic rim': '5" 塑料圈轮',
      '5" alu rim': '5" 铝圈轮',
      "Standard alu fork": "标准铝前叉",
      "Long alu fork": "加长铝前叉",
      "One arm alu fork": "单臂铝前叉",
      '22" with 12 spokes': '22" 12辐条',
      '22" with 18 spokes': '22" 18辐条',
      '24" with 12 spokes': '24" 12辐条',
      '24" with 18 spokes': '24" 18辐条',
      '24" with big wheel hub': '24" 大轮毂',
      '24" with carbon fiber': '24" 碳纤轮',
      'Aluminium anodized silver 22"': '铝合金阳极银色 22"',
      'Aluminium anodized silver 24"': '铝合金阳极银色 24"',
      'Aluminium anodized black 22"': '铝合金阳极黑色 22"',
      'Aluminium anodized black 24"': '铝合金阳极黑色 24"',
      'Aluminium big ergonomic with rubber strip 24"': '带橡胶条的大号人体工学铝圈 24"',
      'Carbon fiber 24"': '碳纤维 24"',
      "PU tire": "PU 轮胎",
      "Pneumatic tire": "充气轮胎",
      "Push to brake bended lever": "前推刹车弯杆",
      "Push to brake straight lever": "前推刹车直杆",
      "Push to brake folding extended lever": "前推刹车可折叠延长杆",
      "Pull to brake straight lever": "后拉刹车直杆",
      "Pull to brake folding extended lever": "后拉刹车可折叠延长杆",
      "Scissor's style brake": "剪刀式刹车",
      "Standard stainless steel axle": "标准不锈钢车轴",
      "Tetra release stainless steel axle": "Tetra 快拆不锈钢车轴",
      "Standard titanium axle": "标准钛合金车轴",
      "Tetra release titanium axle": "Tetra 快拆钛合金车轴",
      "None": "无",
      "Left": "左侧",
      "Right": "右侧",
      "Pair": "一对",
      "规则提示": "规则提示",
      "Rule Alerts": "规则提示",
      "Regelhinweise": "规则提示",
      "当前配置无冲突 ✅": "当前配置无冲突 ✅",
      "No conflicts in the current configuration ✅": "当前配置无冲突 ✅",
      "Aktuelle Konfiguration ohne Konflikte ✅": "当前配置无冲突 ✅",
      "汇总与报价": "汇总与报价",
      "Summary & Quote": "汇总与报价",
      "Zusammenfassung & Angebot": "汇总与报价",
      "交货期": "交货期",
      "Lead Time": "交货期",
      "Lieferzeit": "交货期",
      "型号": "型号",
      "Model": "型号",
      "Modell": "型号",
      "基础价": "基础价",
      "Base Price": "基础价",
      "Grundpreis": "基础价",
      "选配加价": "选配加价",
      "Option Surcharge": "选配加价",
      "Aufpreis Optionen": "选配加价",
      "小计": "小计",
      "Subtotal": "小计",
      "Zwischensumme": "小计",
      "折扣": "折扣",
      "Discount": "折扣",
      "Rabatt": "折扣",
      "未税": "未税",
      "Net": "未税",
      "Netto": "未税",
      "VAT": "增值税",
      "MwSt.": "增值税",
      "总价": "总价",
      "Total": "总价",
      "Gesamtpreis": "总价",
      "导出配置单 PDF": "导出配置单 PDF",
      "Export Configuration PDF": "导出配置单 PDF",
      "Konfiguration als PDF exportieren": "导出配置单 PDF",
      "清空选择": "清空选择",
      "Clear Selections": "清空选择",
      "Auswahl zurücksetzen": "清空选择",
      "数量": "数量",
      "Quantity": "数量",
      "Menge": "数量",
      "下单": "下单",
      "Place Order": "下单",
      "Bestellen": "下单",
      "4-6 weeks": "4-6 周",
      "3-5 weeks": "3-5 周",
      "Warten auf Modell": "等待模型",
      "Waiting for model": "等待模型",
      "模型为空或不含几何": "模型为空或不含几何",
      "Model is empty or has no geometry": "模型为空或不含几何",
      "Modell ist leer oder enthält keine Geometrie": "模型为空或不含几何",
      "模型加载失败": "模型加载失败",
      "Model failed to load": "模型加载失败",
      "Modell konnte nicht geladen werden": "模型加载失败"
    }
  },
  "en-US": {
    title: "Wheelchair Configurator",
    map: {
      "轮椅配置器": "Wheelchair Configurator",
      "Rollstuhlkonfigurator": "Wheelchair Configurator",
      "中文": "中文",
      "English": "English",
      "Deutsch": "Deutsch",
      "登录": "Log In",
      "Anmelden": "Log In",
      "轮椅系列": "Wheelchair Series",
      "Modellreihe": "Wheelchair Series",
      "3D-Vorschau": "3D Preview",
      "分类目录": "Categories",
      "Kategorien": "Categories",
      "车架": "Frame",
      "Rahmen": "Frame",
      "座椅布面": "Seat Upholstery",
      "Sitzbespannung": "Seat Upholstery",
      "靠背": "Backrest",
      "Rücken": "Backrest",
      "侧板和扶手": "Side Panels & Armrests",
      "Seitenteile und Armstützen": "Side Panels & Armrests",
      "脚踏板": "Footrest",
      "Fußbrett": "Footrest",
      "前轮": "Front Wheels",
      "Lenkräder": "Front Wheels",
      "后轮": "Rear Wheels",
      "Antriebsräder": "Rear Wheels",
      "刹车": "Brake",
      "Bremse": "Brake",
      "F55 / 车架附件": "F55 / Frame Accessories",
      "F55 / Zubehör Rahmen": "F55 / Frame Accessories",
      "配置": "Configuration",
      "Konfiguration": "Configuration",
      "切换选项会实时校验规则并更新价格": "Switching options validates rules and updates pricing in real time",
      "Beim Wechseln von Optionen werden Regeln geprüft und Preise sofort aktualisiert": "Switching options validates rules and updates pricing in real time",
      "零售": "Retail",
      "经销商 -10%": "Dealer -10%",
      "车架颜色": "Frame Color",
      "前叉角度": "Front Angle",
      "车架长度": "Frame Length",
      "侧架设置": "Lateral Frame Setting",
      "后轮横杆": "Rear Wheels Bar",
      "车架宽度 / 座宽 (SW)": "Frame Width / Seat Width (SW)",
      "座深 (SD)": "Seat Depth (SD)",
      "靠背高度 (BH)": "Backrest Height (BH)",
      "腿长 (LL)": "Leg Length (LL)",
      "靠背管": "Backrest Tube",
      "靠背把手": "Backrest Handles",
      "座椅设置": "Seat Setting",
      "脚踏板设置": "Footrest Setting",
      "前轮设置": "Front Wheel Setting",
      "前叉设置": "Front Forks Setting",
      "后轮设置": "Rear Wheels Setting",
      "扶手圈设置": "Handrim Setting",
      "轮胎设置": "Tyre Setting",
      "刹车设置": "Brake Setting",
      "车轴设置": "Axles Setting",
      "附件 - 防后翻": "Accessories - Anti Tip",
      "附件 - 倾倒辅助": "Accessories - Tipping Help",
      "附件 - 转运轮": "Accessories - Transit Wheels",
      "侧护板": "Skirt Guards",
      "请选择…": "Please select…",
      "请选择...": "Please select…",
      "Bitte wählen…": "Please select…",
      "铝合金": "Aluminium",
      "镁合金": "Magnesium",
      "红色": "Red",
      "绿色": "Green",
      "黄色": "Yellow",
      "蓝色": "Blue",
      "100° 前叉角度": "100° front angle",
      "90° 前叉角度": "90° front angle",
      "标准长度": "Std length",
      "加长长度": "Long length",
      "标准碳纤侧架": "Std lateral frame carbon",
      "加长碳纤侧架": "Extended length lateral frame carbon",
      "碳纤维 0° 外倾角": "Carbon fiber 0° camber",
      "碳纤维 2° 外倾角": "Carbon fiber 2° camber",
      "碳纤维 4° 外倾角": "Carbon fiber 4° camber",
      "无侧护板": "No skirt guards",
      "黑色直板塑料侧护板": "Plastic black straight",
      "直板碳纤侧护板": "Carbon fiber straight",
      "带挡泥板的黑色塑料侧护板": "Plastic black with mudguard",
      "带挡泥板的碳纤侧护板": "Carbon fiber with mudguard",
      "标准管靠背 (BH 30-40)": "STD tube backrest (BH 30-40)",
      "长管靠背 (BH 37-47)": "LONG tube backrest (BH 37-47)",
      "标准弯折靠背把手": "STD bended backrest handles",
      "可折叠靠背把手": "Folding backrest handles",
      "标准座椅带座下袋": "STD seat with underseat pouch",
      "硬质碳纤座板": "Rigid carbon fiber plate",
      "交叉带座椅": "Crossed band seat",
      "塑料踏板": "Plastic plate",
      "碳纤踏板": "Carbon fiber plate",
      "镁铝踏板": "Magnesium aluminium plate",
      "无踏板（仅框架）": "No plate (only frame)",
      '3" 实心轮': '3" solid',
      '3" 铝圈轮': '3" alu rim',
      '4" 塑料圈轮': '4" plastic rim',
      '4" 铝圈轮': '4" alu rim',
      '5" 塑料圈轮': '5" plastic rim',
      '5" 铝圈轮': '5" alu rim',
      "标准铝前叉": "Standard alu fork",
      "加长铝前叉": "Long alu fork",
      "单臂铝前叉": "One arm alu fork",
      '22" 12辐条': '22" with 12 spokes',
      '22" 18辐条': '22" with 18 spokes',
      '24" 12辐条': '24" with 12 spokes',
      '24" 18辐条': '24" with 18 spokes',
      '24" 大轮毂': '24" with big wheel hub',
      '24" 碳纤轮': '24" with carbon fiber',
      '铝合金阳极银色 22"': 'Aluminium anodized silver 22"',
      '铝合金阳极银色 24"': 'Aluminium anodized silver 24"',
      '铝合金阳极黑色 22"': 'Aluminium anodized black 22"',
      '铝合金阳极黑色 24"': 'Aluminium anodized black 24"',
      '带橡胶条的大号人体工学铝圈 24"': 'Aluminium big ergonomic with rubber strip 24"',
      '碳纤维 24"': 'Carbon fiber 24"',
      "PU 轮胎": "PU tire",
      "充气轮胎": "Pneumatic tire",
      "前推刹车弯杆": "Push to brake bended lever",
      "前推刹车直杆": "Push to brake straight lever",
      "前推刹车可折叠延长杆": "Push to brake folding extended lever",
      "后拉刹车直杆": "Pull to brake straight lever",
      "后拉刹车可折叠延长杆": "Pull to brake folding extended lever",
      "剪刀式刹车": "Scissor's style brake",
      "标准不锈钢车轴": "Standard stainless steel axle",
      "Tetra 快拆不锈钢车轴": "Tetra release stainless steel axle",
      "标准钛合金车轴": "Standard titanium axle",
      "Tetra 快拆钛合金车轴": "Tetra release titanium axle",
      "无": "None",
      "左侧": "Left",
      "右侧": "Right",
      "一对": "Pair",
      "规则提示": "Rule Alerts",
      "Regelhinweise": "Rule Alerts",
      "当前配置无冲突 ✅": "No conflicts in the current configuration ✅",
      "Aktuelle Konfiguration ohne Konflikte ✅": "No conflicts in the current configuration ✅",
      "汇总与报价": "Summary & Quote",
      "Zusammenfassung & Angebot": "Summary & Quote",
      "交货期": "Lead Time",
      "Lieferzeit": "Lead Time",
      "型号": "Model",
      "Modell": "Model",
      "基础价": "Base Price",
      "Grundpreis": "Base Price",
      "选配加价": "Option Surcharge",
      "Aufpreis Optionen": "Option Surcharge",
      "小计": "Subtotal",
      "Zwischensumme": "Subtotal",
      "折扣": "Discount",
      "Rabatt": "Discount",
      "未税": "Net",
      "Netto": "Net",
      "增值税": "VAT",
      "MwSt.": "VAT",
      "总价": "Total",
      "Gesamtpreis": "Total",
      "导出配置单 PDF": "Export Configuration PDF",
      "Konfiguration als PDF exportieren": "Export Configuration PDF",
      "清空选择": "Clear Selections",
      "Auswahl zurücksetzen": "Clear Selections",
      "数量": "Quantity",
      "Menge": "Quantity",
      "下单": "Place Order",
      "Bestellen": "Place Order",
      "4-6 周": "4-6 weeks",
      "3-5 周": "3-5 weeks",
      "等待模型": "Waiting for model",
      "Warten auf Modell": "Waiting for model",
      "模型为空或不含几何": "Model is empty or has no geometry",
      "Modell ist leer oder enthält keine Geometrie": "Model is empty or has no geometry",
      "模型加载失败": "Model failed to load",
      "Modell konnte nicht geladen werden": "Model failed to load"
    }
  },
  "de-DE": {
    title: "Rollstuhlkonfigurator",
    map: {
      "轮椅配置器": "Rollstuhlkonfigurator",
      "Wheelchair Configurator": "Rollstuhlkonfigurator",
      "中文": "中文",
      "English": "English",
      "Deutsch": "Deutsch",
      "登录": "Anmelden",
      "Log In": "Anmelden",
      "轮椅系列": "Modellreihe",
      "Wheelchair Series": "Modellreihe",
      "3D Preview": "3D-Vorschau",
      "分类目录": "Kategorien",
      "Categories": "Kategorien",
      "车架": "Rahmen",
      "座椅布面": "Sitzbespannung",
      "靠背": "Rücken",
      "侧板和扶手": "Seitenteile und Armstützen",
      "脚踏板": "Fußbrett",
      "前轮": "Lenkräder",
      "后轮": "Antriebsräder",
      "刹车": "Bremse",
      "F55 / 车架附件": "F55 / Zubehör Rahmen",
      "配置": "Konfiguration",
      "Configuration": "Konfiguration",
      "切换选项会实时校验规则并更新价格": "Beim Wechseln von Optionen werden Regeln geprüft und Preise sofort aktualisiert",
      "Switching options validates rules and updates pricing in real time": "Beim Wechseln von Optionen werden Regeln geprüft und Preise sofort aktualisiert",
      "零售": "Retail",
      "Retail": "Retail",
      "经销商 -10%": "Dealer -10%",
      "Dealer -10%": "Dealer -10%",
      "Frame": "Rahmen",
      "Frame Color": "Rahmenfarbe",
      "Front Angle": "Frontwinkel",
      "Frame Length": "Rahmenlänge",
      "Lateral Frame Setting": "Seitlicher Rahmen",
      "Rear Wheels Bar": "Hinterradstange",
      "Seat Width (SW)": "Rahmenbreite / Sitzbreite (SW)",
      "Seat Depth (SD)": "Sitztiefe (SD)",
      "Backrest Height (BH)": "Rückenhöhe (BH)",
      "Leg Length (LL)": "Beinlänge (LL)",
      "Backrest Tube": "Rückenrohr",
      "Backrest Handles": "Rückengriffe",
      "Seat Setting": "Sitzeinstellung",
      "Footrest Setting": "Fußbrett-Einstellung",
      "Front Wheel Setting": "Lenkrad-Einstellung",
      "Front Forks Setting": "Gabel-Einstellung",
      "Rear Wheels Setting": "Antriebsrad-Einstellung",
      "Handrim Setting": "Greifreifen-Einstellung",
      "Tyre Setting": "Reifen-Einstellung",
      "Brake Setting": "Brems-Einstellung",
      "Axles Setting": "Achs-Einstellung",
      "Accessories - Anti Tipp": "Zubehör - Kippschutz",
      "Accessories - Anti Tip": "Zubehör - Kippschutz",
      "Accessories - Tipping Help": "Zubehör - Kipphebel",
      "Accessories - Transit Wheels": "Zubehör - Transporträder",
      "Skirt Guards": "Seitenschutz",
      "请选择…": "Bitte wählen…",
      "请选择...": "Bitte wählen…",
      "Please select…": "Bitte wählen…",
      "Aluminium": "Aluminium",
      "Magnesium": "Magnesium",
      "Red": "Rot",
      "Green": "Grün",
      "Yellow": "Gelb",
      "Blue": "Blau",
      "100° front angle": "100° Frontwinkel",
      "90° front angle": "90° Frontwinkel",
      "Std length": "Standardlänge",
      "Long length": "Langversion",
      "Std lateral frame carbon": "Standard Seitenrahmen Carbon",
      "Extended length lateral frame carbon": "Langer Seitenrahmen Carbon",
      "Carbon fiber 0° camber": "Carbonfaser 0° Sturz",
      "Carbon fiber 2° camber": "Carbonfaser 2° Sturz",
      "Carbon fiber 4° camber": "Carbonfaser 4° Sturz",
      "No skirt guards": "Kein Seitenschutz",
      "Plastic black straight": "Kunststoff schwarz gerade",
      "Carbon fiber straight": "Carbon gerade",
      "Plastic black with mudguard": "Kunststoff schwarz mit Spritzschutz",
      "Carbon fiber with mudguard": "Carbon mit Spritzschutz",
      "STD tube backrest (BH 30-40)": "Standard-Rückenrohr (BH 30-40)",
      "LONG tube backrest (BH 37-47)": "Langes Rückenrohr (BH 37-47)",
      "STD bended backrest handles": "Standard gebogene Rückengriffe",
      "Folding backrest handles": "Klappbare Rückengriffe",
      "STD seat with underseat pouch": "Standardsitz mit Untertasche",
      "Rigid carbon fiber plate": "Starre Carbon-Sitzplatte",
      "Crossed band seat": "Kreuzgurt-Sitz",
      "Plastic plate": "Kunststoffplatte",
      "Carbon fiber plate": "Carbonplatte",
      "Magnesium aluminium plate": "Magnesium-Aluminium-Platte",
      "No plate (only frame)": "Keine Platte (nur Rahmen)",
      '3" solid': '3" Vollgummi',
      '3" alu rim': '3" Alufelge',
      '4" plastic rim': '4" Kunststofffelge',
      '4" alu rim': '4" Alufelge',
      '5" plastic rim': '5" Kunststofffelge',
      '5" alu rim': '5" Alufelge',
      "Standard alu fork": "Standard-Alugabel",
      "Long alu fork": "Lange Alugabel",
      "One arm alu fork": "Einarm-Alugabel",
      '22" with 12 spokes': '22" mit 12 Speichen',
      '22" with 18 spokes': '22" mit 18 Speichen',
      '24" with 12 spokes': '24" mit 12 Speichen',
      '24" with 18 spokes': '24" mit 18 Speichen',
      '24" with big wheel hub': '24" mit großer Nabe',
      '24" with carbon fiber': '24" mit Carbonfaser',
      'Aluminium anodized silver 22"': 'Aluminium eloxiert silber 22"',
      'Aluminium anodized silver 24"': 'Aluminium eloxiert silber 24"',
      'Aluminium anodized black 22"': 'Aluminium eloxiert schwarz 22"',
      'Aluminium anodized black 24"': 'Aluminium eloxiert schwarz 24"',
      'Aluminium big ergonomic with rubber strip 24"': 'Aluminium ergonomisch groß mit Gummileiste 24"',
      'Carbon fiber 24"': 'Carbonfaser 24"',
      "PU tire": "PU-Reifen",
      "Pneumatic tire": "Luftreifen",
      "Push to brake bended lever": "Drücken zum Bremsen, gebogener Hebel",
      "Push to brake straight lever": "Drücken zum Bremsen, gerader Hebel",
      "Push to brake folding extended lever": "Drücken zum Bremsen, klappbarer Verlängerungshebel",
      "Pull to brake straight lever": "Ziehen zum Bremsen, gerader Hebel",
      "Pull to brake folding extended lever": "Ziehen zum Bremsen, klappbarer Verlängerungshebel",
      "Scissor's style brake": "Scherenbremse",
      "Standard stainless steel axle": "Standard-Edelstahlachse",
      "Tetra release stainless steel axle": "Tetra-Schnellspannachse Edelstahl",
      "Standard titanium axle": "Standard-Titanachse",
      "Tetra release titanium axle": "Tetra-Schnellspannachse Titan",
      "None": "Keine",
      "Left": "Links",
      "Right": "Rechts",
      "Pair": "Paar",
      "规则提示": "Regelhinweise",
      "Rule Alerts": "Regelhinweise",
      "当前配置无冲突 ✅": "Aktuelle Konfiguration ohne Konflikte ✅",
      "No conflicts in the current configuration ✅": "Aktuelle Konfiguration ohne Konflikte ✅",
      "汇总与报价": "Zusammenfassung & Angebot",
      "Summary & Quote": "Zusammenfassung & Angebot",
      "交货期": "Lieferzeit",
      "Lead Time": "Lieferzeit",
      "型号": "Modell",
      "Model": "Modell",
      "基础价": "Grundpreis",
      "Base Price": "Grundpreis",
      "选配加价": "Aufpreis Optionen",
      "Option Surcharge": "Aufpreis Optionen",
      "小计": "Zwischensumme",
      "Subtotal": "Zwischensumme",
      "折扣": "Rabatt",
      "Discount": "Rabatt",
      "未税": "Netto",
      "Net": "Netto",
      "增值税": "MwSt.",
      "VAT": "MwSt.",
      "总价": "Gesamtpreis",
      "Total": "Gesamtpreis",
      "导出配置单 PDF": "Konfiguration als PDF exportieren",
      "Export Configuration PDF": "Konfiguration als PDF exportieren",
      "清空选择": "Auswahl zurücksetzen",
      "Clear Selections": "Auswahl zurücksetzen",
      "数量": "Menge",
      "Quantity": "Menge",
      "下单": "Bestellen",
      "Place Order": "Bestellen",
      "4-6 周": "4-6 Wochen",
      "3-5 周": "3-5 Wochen",
      "4-6 weeks": "4-6 Wochen",
      "3-5 weeks": "3-5 Wochen",
      "等待模型": "Warten auf Modell",
      "Waiting for model": "Warten auf Modell",
      "模型为空或不含几何": "Modell ist leer oder enthält keine Geometrie",
      "Model is empty or has no geometry": "Modell ist leer oder enthält keine Geometrie",
      "模型加载失败": "Modell konnte nicht geladen werden",
      "Model failed to load": "Modell konnte nicht geladen werden"
    }
  }
};

const WC_TEXT_PATCHES = {
  "zh-CN": {
    "frameMaterial": "\u8f66\u67b6",
    "frameColor": "\u8f66\u67b6\u989c\u8272",
    "frameAngle": "\u524d\u53c9\u89d2\u5ea6",
    "frameLength": "\u8f66\u67b6\u957f\u5ea6",
    "seatWidth": "\u8f66\u67b6\u5bbd\u5ea6",
    "seatDepth": "\u5ea7\u6df1",
    "backrestHeight": "\u9760\u80cc\u9ad8\u5ea6",
    "legLength": "\u817f\u957f",
    "lateralFrame": "\u4fa7\u67b6\u8bbe\u7f6e",
    "rearWheelsBar": "\u540e\u8f6e\u6a2a\u6746",
    "skirtGuards": "\u4fa7\u62a4\u677f",
    "backrestTube": "\u9760\u80cc\u7ba1",
    "backrestHandles": "\u9760\u80cc\u628a\u624b",
    "seatSetting": "\u5ea7\u9762\u8bbe\u7f6e",
    "footrestSetting": "\u811a\u8e0f\u677f\u8bbe\u7f6e",
    "frontWheel": "\u524d\u8f6e\u8bbe\u7f6e",
    "frontFork": "\u524d\u53c9\u8bbe\u7f6e",
    "rearWheel": "\u540e\u8f6e\u8bbe\u7f6e",
    "handrim": "\u624b\u63a8\u5708\u8bbe\u7f6e",
    "tyre": "\u8f6e\u80ce\u8bbe\u7f6e",
    "brake": "\u5239\u8f66\u8bbe\u7f6e",
    "axle": "\u8f66\u8f74\u8bbe\u7f6e",
    "accessoryAntitipp": "\u9644\u4ef6 - \u9632\u540e\u7ffb",
    "accessoryTippingHelp": "\u9644\u4ef6 - \u503e\u5012\u8f85\u52a9",
    "accessoryTransitWheels": "\u9644\u4ef6 - \u8f6c\u8fd0\u8f6e",
    "\u5207\u6362\u9009\u9879\u4f1a\u5b9e\u65f6\u6821\u9a8c\u89c4\u5219\u5e76\u66f4\u65b0\u4ef7\u683c": "\u5df2\u9009\u914d\u7f6e\u4f1a\u540c\u6b65\u66f4\u65b0\u5230\u6c47\u603b\u533a\u57df",
    "Switching options validates rules and updates pricing in real time": "\u5df2\u9009\u914d\u7f6e\u4f1a\u540c\u6b65\u66f4\u65b0\u5230\u6c47\u603b\u533a\u57df",
    "Beim Wechseln von Optionen werden Regeln gepr\u00fcft und Preise sofort aktualisiert": "\u5df2\u9009\u914d\u7f6e\u4f1a\u540c\u6b65\u66f4\u65b0\u5230\u6c47\u603b\u533a\u57df",
    "\u8bf7\u9009\u62e9\u2026": "\u2014",
    "\u8bf7\u9009\u62e9...": "\u2014",
    "Please select\u2026": "\u2014",
    "Bitte w\u00e4hlen\u2026": "\u2014",
    "\u5f53\u524d\u914d\u7f6e\u65e0\u51b2\u7a81 \u2705": "\u5f53\u524d\u914d\u7f6e\u5df2\u786e\u8ba4",
    "No conflicts in the current configuration \u2705": "\u5f53\u524d\u914d\u7f6e\u5df2\u786e\u8ba4",
    "Aktuelle Konfiguration ohne Konflikte \u2705": "\u5f53\u524d\u914d\u7f6e\u5df2\u786e\u8ba4"
  },
  "en-US": {
    "frameMaterial": "Frame",
    "frameColor": "Frame Color",
    "frameAngle": "Front Angle",
    "frameLength": "Frame Length",
    "seatWidth": "Frame Width",
    "seatDepth": "Seat Depth",
    "backrestHeight": "Backrest Height",
    "legLength": "Leg Length",
    "lateralFrame": "Lateral Frame",
    "rearWheelsBar": "Rear Wheels Bar",
    "skirtGuards": "Skirt Guards",
    "backrestTube": "Backrest Tube",
    "backrestHandles": "Backrest Handles",
    "seatSetting": "Seat Setting",
    "footrestSetting": "Footrest Setting",
    "frontWheel": "Front Wheel Setting",
    "frontFork": "Front Fork Setting",
    "rearWheel": "Rear Wheel Setting",
    "handrim": "Handrim Setting",
    "tyre": "Tyre Setting",
    "brake": "Brake Setting",
    "axle": "Axle Setting",
    "accessoryAntitipp": "Accessory - Anti Tip",
    "accessoryTippingHelp": "Accessory - Tipping Help",
    "accessoryTransitWheels": "Accessory - Transit Wheels",
    "\u5207\u6362\u9009\u9879\u4f1a\u5b9e\u65f6\u6821\u9a8c\u89c4\u5219\u5e76\u66f4\u65b0\u4ef7\u683c": "Selections update instantly in the summary",
    "Switching options validates rules and updates pricing in real time": "Selections update instantly in the summary",
    "Beim Wechseln von Optionen werden Regeln gepr\u00fcft und Preise sofort aktualisiert": "Selections update instantly in the summary",
    "\u8bf7\u9009\u62e9\u2026": "\u2014",
    "\u8bf7\u9009\u62e9...": "\u2014",
    "Please select\u2026": "\u2014",
    "Bitte w\u00e4hlen\u2026": "\u2014",
    "\u5f53\u524d\u914d\u7f6e\u65e0\u51b2\u7a81 \u2705": "Configuration confirmed",
    "No conflicts in the current configuration \u2705": "Configuration confirmed",
    "Aktuelle Konfiguration ohne Konflikte \u2705": "Configuration confirmed"
  }
};

Object.keys(WC_TEXT_PATCHES).forEach((lang) => {
  const locale = WC_TEXT[lang];
  if (!locale || !locale.map) return;
  Object.assign(locale.map, WC_TEXT_PATCHES[lang]);
});

function wcTranslateDynamicText(text, lang) {
  const trimmed = text.trim();
  const locale = WC_TEXT[lang] || WC_TEXT[WC_DEFAULT_LANG];
  const map = locale.map;
  if (map[trimmed]) return text.replace(trimmed, map[trimmed]);

  const loadingMatch = trimmed.match(/^(加载中|Loading)\.\.\.\s*(\d+%)$/);
  if (loadingMatch) {
    const prefix = lang === "en-US" ? "Loading..." : "加载中...";
    return text.replace(trimmed, `${prefix} ${loadingMatch[2]}`);
  }

  const loggedInMatch = trimmed.match(/^(已登录：|Logged in: )(.+)$/);
  if (loggedInMatch) {
    const dealerName =
      loggedInMatch[2] === "贸易商A"
        ? lang === "en-US"
          ? "Dealer A"
          : "贸易商A"
        : loggedInMatch[2];
    const prefix = lang === "en-US" ? "Logged in: " : "已登录：";
    return text.replace(trimmed, `${prefix}${dealerName}`);
  }

  return text;
}

function wcEnsureLanguageSelect(lang) {
  const select = document.querySelector(".select.compact");
  if (!select) return null;

  const labels = {
    "zh-CN": "中文",
    "en-US": "English"
  };

  [...select.options].forEach(option => {
    if (!WC_SUPPORTED_LANGS.includes(option.value)) {
      option.remove();
      return;
    }
    option.textContent = labels[option.value] || option.textContent;
  });

  WC_SUPPORTED_LANGS.forEach(code => {
    const exists = [...select.options].some(option => option.value === code);
    if (!exists) {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = labels[code];
      select.appendChild(option);
    }
  });

  if (select.value !== lang) {
    select.value = lang;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    select.dispatchEvent(new Event("input", { bubbles: true }));
  }

  return select;
}

function wcIsMobileViewport() {
  return window.innerWidth <= 768;
}

function wcDiagnosticText(lang) {
  if (lang === "en-US") {
    return {
      title: "3D model is taking too long to load",
      body:
        "If you are using iPhone or iPad, refresh the page once first. If the model still does not appear, try Safari and make sure Low Power Mode is off.",
      tips: [
        "Keep the page open for 20-30 seconds on the first load.",
        "Switch between Wi-Fi and mobile data once.",
        "If it still fails, send us your device model, iOS version, and browser."
      ]
    };
  }
  return {
    title: "3D 模型加载时间过长",
    body:
      "如果您使用的是 iPhone 或 iPad，请先刷新一次页面。如果模型仍未显示，请优先使用 Safari，并确认已关闭低电量模式。",
    tips: [
      "首次打开时请保持页面停留 20-30 秒。",
      "可以尝试在 Wi-Fi 和移动数据之间切换一次。",
      "如果仍失败，请把设备型号、iOS 版本和浏览器告诉我们。"
    ]
  };
}

function wcEnsureDiagnosticStyle() {
  const styleId = "wc-model-diagnostic-style";
  if (document.getElementById(styleId)) return;
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    #${WC_MODEL_DIAG_ID}{
      margin-top:12px;
      padding:14px 14px 12px;
      border:1px solid rgba(255,184,77,.35);
      border-radius:14px;
      background:linear-gradient(180deg, rgba(255,196,92,.14), rgba(255,168,54,.08));
      color:#f6ead7;
      box-shadow:0 10px 24px rgba(0,0,0,.14);
    }
    #${WC_MODEL_DIAG_ID} strong{
      display:block;
      margin-bottom:8px;
      font-size:14px;
      line-height:1.35;
    }
    #${WC_MODEL_DIAG_ID} p{
      margin:0 0 8px;
      font-size:13px;
      line-height:1.5;
      color:#f7dfbb;
    }
    #${WC_MODEL_DIAG_ID} ul{
      margin:0;
      padding-left:18px;
      font-size:12px;
      line-height:1.5;
      color:#f3d5a5;
    }
  `;
  document.head.appendChild(style);
}

function wcHideModelDiagnostic() {
  document.getElementById(WC_MODEL_DIAG_ID)?.remove();
}

function wcRenderModelDiagnostic(lang) {
  if (!wcIsMobileViewport()) {
    wcHideModelDiagnostic();
    return;
  }
  const modelViewer = document.querySelector(".model-viewer");
  if (!modelViewer) return;

  wcEnsureDiagnosticStyle();
  let box = document.getElementById(WC_MODEL_DIAG_ID);
  if (!box) {
    box = document.createElement("div");
    box.id = WC_MODEL_DIAG_ID;
    modelViewer.insertAdjacentElement("afterend", box);
  }

  const text = wcDiagnosticText(lang);
  box.innerHTML = `
    <strong>${text.title}</strong>
    <p>${text.body}</p>
    <ul>${text.tips.map(item => `<li>${item}</li>`).join("")}</ul>
  `;
}

function wcRefreshModelDiagnostic() {
  const lang = localStorage.getItem(WC_I18N_STORAGE_KEY) || WC_DEFAULT_LANG;
  const hasCanvas = document.querySelectorAll(".model-viewer canvas").length > 0;
  const placeholder = (document.querySelector(".model-viewer .model-placeholder")?.textContent || "").trim();
  if (hasCanvas || !placeholder) {
    wcHideModelDiagnostic();
    return;
  }
  if (
    /模型加载失败|Model failed to load/.test(placeholder) ||
    (wcIsMobileViewport() &&
      /加载中|Loading/.test(placeholder) &&
      document.querySelector(".model-viewer"))
  ) {
    wcRenderModelDiagnostic(lang);
  }
}

function wcForceCategoryLabels(lang) {
  const labels =
    lang === "en-US"
      ? [
          "Frame",
          "Seat Upholstery",
          "Backrest",
          "Side Panels & Armrests",
          "Footrest",
          "Front Wheels",
          "Rear Wheels",
          "Brake",
          "F55 / Frame Accessories"
        ]
      : [
          "车架",
          "座椅布面",
          "靠背",
          "侧板和扶手",
          "脚踏板",
          "前轮",
          "后轮",
          "刹车",
          "F55 / 车架附件"
        ];

  document.querySelectorAll(".category-btn").forEach((button, index) => {
    const textNode = button.querySelector("span:last-child");
    if (textNode && labels[index]) {
      textNode.textContent = labels[index];
    }
  });
}

let wcModelDiagnosticTimer = 0;

function wcScheduleModelDiagnostic() {
  window.clearTimeout(wcModelDiagnosticTimer);
  wcModelDiagnosticTimer = window.setTimeout(() => {
    wcRefreshModelDiagnostic();
  }, 18000);
}

function wcApplyTranslations(lang) {
  const locale = WC_TEXT[lang] || WC_TEXT[WC_DEFAULT_LANG];
  document.documentElement.lang = lang;
  document.title = locale.title;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  for (const node of textNodes) {
    const parent = node.parentElement;
    if (!parent || parent.tagName === "SCRIPT" || parent.tagName === "STYLE") continue;
    const translated = wcTranslateDynamicText(node.textContent || "", lang);
    if (translated !== node.textContent) node.textContent = translated;
  }

  const styleId = "wc-i18n-style";
  let style = document.getElementById(styleId);
  if (!style) {
    style = document.createElement("style");
    style.id = styleId;
    document.head.appendChild(style);
  }
  style.textContent = ".option-code{display:none!important}";

  wcEnsureLanguageSelect(lang);
  wcForceCategoryLabels(lang);
  wcRefreshModelDiagnostic();
}

function wcSetLanguage(lang) {
  const nextLang = WC_SUPPORTED_LANGS.includes(lang) ? lang : WC_DEFAULT_LANG;
  localStorage.setItem(WC_I18N_STORAGE_KEY, nextLang);
  wcApplyTranslations(nextLang);
}

function wcRefreshTranslations() {
  const currentLang = localStorage.getItem(WC_I18N_STORAGE_KEY) || WC_DEFAULT_LANG;
  wcApplyTranslations(currentLang);
  wcScheduleModelDiagnostic();
  wcBindLanguageSelect();
}

function wcBindLanguageSelect() {
  const select = document.querySelector(".select.compact");
  if (select && !select.dataset.wcI18nBound) {
    select.dataset.wcI18nBound = "true";
    select.addEventListener("change", event => {
      wcSetLanguage(event.target.value);
    });
  }
}

function wcBootI18nSync() {
  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    const currentLang = localStorage.getItem(WC_I18N_STORAGE_KEY) || WC_DEFAULT_LANG;
    wcApplyTranslations(currentLang);
    wcScheduleModelDiagnostic();
    wcBindLanguageSelect();

    if ((document.querySelector(".card.header") && document.querySelector(".grid.grid-2")) || attempts > 40) {
      window.clearInterval(timer);
    }
  }, 250);
}

function wcInitI18n() {
  const initialLang = localStorage.getItem(WC_I18N_STORAGE_KEY) || WC_DEFAULT_LANG;
  wcSetLanguage(initialLang);
  wcScheduleModelDiagnostic();
  wcBindLanguageSelect();
  wcBootI18nSync();
  window.__WC_I18N = {
    setLanguage: wcSetLanguage,
    refresh: wcRefreshTranslations,
    apply: wcApplyTranslations,
    translateText(text, lang) {
      return wcTranslateDynamicText(String(text == null ? "" : text), lang || (localStorage.getItem(WC_I18N_STORAGE_KEY) || WC_DEFAULT_LANG));
    }
  };
  window.addEventListener("wc:refresh-i18n", wcRefreshTranslations);
  window.addEventListener("resize", wcRefreshModelDiagnostic);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", wcInitI18n, { once: true });
} else {
  wcInitI18n();
}
