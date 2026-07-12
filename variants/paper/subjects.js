(function attachDrivingData(root) {
  "use strict";

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.values(value).forEach(deepFreeze);
    return Object.freeze(value);
  }

  const dayOne = {
    day: 1,
    minutes: 1,
    title: "先停在这一分钟",
    action: "坐稳，放松肩膀，跟随一轮 4–2–6 呼吸。",
    interactive: true
  };

  const HAPPINESS_DRIVING_DATA = deepFreeze({
    subjects: {
      s2: {
        id: "s2",
        number: "科目二",
        name: "夫妻同行",
        meta: "12 题 · 约 4 分钟",
        dimension_codes: ["A1", "A2", "A3"]
      },
      s3: {
        id: "s3",
        number: "科目三",
        name: "亲子上路",
        meta: "12 题 · 约 4 分钟",
        dimension_codes: ["B1", "B2", "B3"]
      }
    },
    dimensions: [
      {
        code: "A1",
        name: "情感连接",
        module: "夫妻（科目二）",
        items: [
          {
            id: "A1-1",
            text: "TA出门或回家时，你们之间有没有一句道别、一个迎接？",
            options: [
              { text: "几乎每次都有", value: 2 },
              { text: "想起来才有", value: 1 },
              { text: "基本没有", value: 0 }
            ],
            source: "原表题号 2 改写",
            deduction: "道别省成了静音模式"
          },
          {
            id: "A1-2",
            text: "最近一个月，你有没有对爱人说过\"谢谢\"，或者表达过爱意？",
            options: [
              { text: "说过好几次", value: 2 },
              { text: "说过一两次", value: 1 },
              { text: "想不起来了", value: 0 }
            ],
            source: "原表题号 18 改写",
            deduction: "谢谢卡在了发送前"
          },
          {
            id: "A1-3",
            text: "爱人身体不舒服的时候，你通常怎么做？",
            options: [
              { text: "放下手头的事照顾TA", value: 2 },
              { text: "口头关心，提醒TA吃药休息", value: 1 },
              { text: "各自扛着，很少过问", value: 0 }
            ],
            source: "原表题号 14 改写",
            deduction: "各扛各的，副驾暂时缺席"
          },
          {
            id: "A1-4",
            text: "你们平时还有牵手、拥抱、依偎这类身体上的亲近吗？",
            options: [
              { text: "经常有，很自然", value: 2 },
              { text: "偶尔有", value: 1 },
              { text: "几乎没有了", value: 0 }
            ],
            source: "新增（家庭关系专家：夫妻亲密构面全卷空白，53题只测了亲子肢体互动）",
            deduction: "拥抱退出了日常"
          }
        ],
        insight_low: "很多婚姻不是吵散的，是淡下去的。感谢没说出口、拥抱停在很多年前——爱可能还在，只是不再被对方接收到。",
        training_direction: "关系（7天\"看见对方\"陪练：每天一句具体感谢 / 一次主动的身体靠近 / 一次认真的道别）"
      },
      {
        code: "A2",
        name: "同盟与决策",
        module: "夫妻（科目二）",
        items: [
          {
            id: "A2-1",
            text: "遇到重要的事，你是先和爱人商量，还是自己定了再通知TA？",
            options: [
              { text: "基本都先商量", value: 2 },
              { text: "看情况，有时商量", value: 1 },
              { text: "多半自己定了再说", value: 0 }
            ],
            source: "原表题号 8 改写",
            deduction: "大事习惯先斩后奏"
          },
          {
            id: "A2-2",
            text: "家里的钱怎么花，你们是商量着来，还是一方说了算？",
            options: [
              { text: "大事小事都商量", value: 2 },
              { text: "大额支出才商量", value: 1 },
              { text: "基本一方说了算", value: 0 }
            ],
            source: "原表题号 17 改写",
            deduction: "家庭账本单人驾驶"
          },
          {
            id: "A2-3",
            text: "你们多久有一次只属于两个人的时间——不带孩子、不谈家务？",
            options: [
              { text: "每周都有", value: 2 },
              { text: "每月能有一两次", value: 1 },
              { text: "想不起来上一次是什么时候", value: 0 }
            ],
            source: "原表题号 21 改写",
            deduction: "二人时间长期停运"
          },
          {
            id: "A2-4",
            text: "爱人有自己的爱好或想做的事时，你的态度更接近哪种？",
            options: [
              { text: "支持TA，还会搭把手", value: 2 },
              { text: "不反对，但也不参与", value: 1 },
              { text: "觉得没必要，会拦着", value: 0 }
            ],
            source: "原表题号 5 改写（与\"支持梦想\"合写，替代已删的兴趣类重复题）",
            deduction: "对方的爱好被亮了红叉"
          }
        ],
        insight_low: "同一个屋檐下，各开各的车。决定不商量、钱不透明、两个人的时间被孩子和家务挤没了——你们是合作方，还不够像队友。",
        training_direction: "关系（7天\"队友练习\"：一次真正的共同决定 / 一次写进日历的二人时间 / 一次为对方的爱好搭把手）"
      },
      {
        code: "A3",
        name: "冲突与修复",
        module: "夫妻（科目二）",
        items: [
          {
            id: "A3-1",
            text: "爱人跟你倾诉烦心事时，你的第一反应通常是？",
            options: [
              { text: "先关心TA的感受", value: 2 },
              { text: "一边安慰一边给建议", value: 1 },
              { text: "先分析事情谁对谁错", value: 0 }
            ],
            source: "原表题号 9 改写（拆掉绕口的\"换位思考\"表述，改场景直问）",
            deduction: "倾诉一开场就先判案"
          },
          {
            id: "A3-2",
            text: "你们吵架时，会不会出现翻旧账、嘲讽，或者\"你总是/你从不\"这类话？",
            options: [
              { text: "基本不会，就事论事", value: 2 },
              { text: "有时会冒出来", value: 1 },
              { text: "几乎每次都有", value: 0 }
            ],
            source: "新增（Gottman四骑士：蔑视与批评是关系恶化最强预测项，原卷冲突构面几乎空白）",
            deduction: "吵一架顺手翻了全册",
            hazard: "翻旧账、嘲讽或贬低"
          },
          {
            id: "A3-3",
            text: "闹了矛盾之后，你们一般多久能和好？",
            options: [
              { text: "当天就能缓和", value: 2 },
              { text: "两三天", value: 1 },
              { text: "一周以上，甚至冷战", value: 0 }
            ],
            source: "原表题号 11 改写（去掉\"分床分居\"预设）",
            deduction: "冷战续航从一周起步",
            hazard: "冷战一周以上"
          },
          {
            id: "A3-4",
            text: "和好之后，你们会把那次矛盾聊开，还是假装没发生过？",
            options: [
              { text: "会聊开，说清各自的感受", value: 2 },
              { text: "偶尔聊，多数直接翻篇", value: 1 },
              { text: "从不提，下次接着吵同一件事", value: 0 }
            ],
            source: "新增（修复尝试是否被接收；与第11题共同构成\"断了怎么接回来\"组）",
            deduction: "和好只按了跳过键"
          }
        ],
        insight_low: "吵架不可怕，可怕的是吵法：翻旧账、冷战、假装没发生。矛盾没有被修复，只是被存档了——存多了，会连本带息地爆发。",
        training_direction: "关系（冲突修复系列：吵架暂停术——情绪上头先喊停 / 24小时内复盘一次 / 把\"你总是\"改成\"我希望\"）"
      },
      {
        code: "B1",
        name: "亲密陪伴",
        module: "亲子（科目三）",
        items: [
          {
            id: "B1-1",
            text: "孩子会主动跟你分享TA的心情、朋友和新发现吗？",
            options: [
              { text: "经常主动说", value: 2 },
              { text: "你问才说一点", value: 1 },
              { text: "基本不跟你说", value: 0 }
            ],
            source: "原表题号 22 改写（用孩子的趋近行为做结果指标，替代已删的34\"沟通是否顺畅\"自评）",
            deduction: "孩子的分享欲转成了静音"
          },
          {
            id: "B1-2",
            text: "陪孩子的时候，你的手机在哪儿？",
            options: [
              { text: "放一边，大部分时间专注陪TA", value: 2 },
              { text: "在手边，时不时看两眼", value: 1 },
              { text: "人在心不在，基本在刷手机", value: 0 }
            ],
            source: "原表题号 25 改写（时长改质量：不误伤高压职场父母，直击\"低头族陪伴\"痛点）",
            deduction: "陪娃时手机坐了主位"
          },
          {
            id: "B1-3",
            text: "你和孩子之间还有拥抱、击掌、揉揉头这类身体互动吗？",
            options: [
              { text: "每天都有", value: 2 },
              { text: "偶尔有", value: 1 },
              { text: "几乎没有", value: 0 }
            ],
            source: "原表题号 53 改写（\"眼神交流\"改为可观察的身体接触行为）",
            deduction: "亲近动作长期欠费"
          },
          {
            id: "B1-4",
            text: "孩子做得好的时候，你会具体说出TA好在哪儿吗？",
            options: [
              { text: "会具体说，比如\"这一步你想得真细\"", value: 2 },
              { text: "会夸，但多是一句\"真棒\"带过", value: 1 },
              { text: "很少夸，怕TA骄傲", value: 0 }
            ],
            source: "原表题号 27 改写（笼统\"表扬\"升级为过程性表扬的行为锚点）",
            deduction: "好表现只收到了沉默"
          }
        ],
        insight_low: "孩子不缺你在场，缺你\"在线\"。人在心不在的陪伴，孩子分得出来——TA不再跟你分享，往往就是从你低头看手机的那几年开始的。",
        training_direction: "亲子（7天专注陪伴：每天15分钟无手机时间 / 一句说出细节的表扬 / 一个出门前的击掌）"
      },
      {
        code: "B2",
        name: "尊重与回应",
        module: "亲子（科目三）",
        items: [
          {
            id: "B2-1",
            text: "孩子自己的事——穿什么、学什么兴趣、交什么朋友，通常谁说了算？",
            options: [
              { text: "TA自己拿主意，我提供参考", value: 2 },
              { text: "听TA说，但最后常是我定", value: 1 },
              { text: "基本我替TA决定", value: 0 }
            ],
            source: "原表题号 33 改写（修非单调锚点：原B\"适当引导\"是理想教养不是中间档）",
            deduction: "孩子的方向盘被全程代驾"
          },
          {
            id: "B2-2",
            text: "孩子的日记、手机、房间，你会先敲门、先问过TA再动吗？",
            options: [
              { text: "一直这样，TA的秘密归TA", value: 2 },
              { text: "大体尊重，着急了也翻过", value: 1 },
              { text: "我是家长，看看能怎么了", value: 0 }
            ],
            source: "原表题号 7/30/49 合并改写（三题同构造，合为一题并聚焦亲子）",
            deduction: "隐私边界被直接闯行",
            hazard: "翻动孩子的手机、日记或房间"
          },
          {
            id: "B2-3",
            text: "孩子大哭或发脾气的时候，你的第一反应是？",
            options: [
              { text: "先接住TA的情绪，缓下来再谈事", value: 2 },
              { text: "先讲道理", value: 1 },
              { text: "先制止：\"不许哭\"\"再闹试试\"", value: 0 }
            ],
            source: "原表题号 37 改写（\"是否关注情绪\"社会赞许自评改为情绪教练场景题，同时覆盖原23犯错回应的构面）",
            deduction: "情绪刚来就先被叫停"
          },
          {
            id: "B2-4",
            text: "错怪了孩子之后，你会道歉吗？",
            options: [
              { text: "会当面认真道歉", value: 2 },
              { text: "有时会，或者用别的方式找补", value: 1 },
              { text: "家长不需要向孩子道歉", value: 0 }
            ],
            source: "原表题号 32 改写（修非单调锚点：原B\"私下道歉\"不是真中档）",
            deduction: "错怪之后没有回执"
          }
        ],
        insight_low: "教育里最贵的东西是尊重：让TA做主、给TA留秘密、错了跟TA道歉。这些不会让你失去权威——只会让TA在外面受了伤时，第一个想到回家。",
        training_direction: "亲子（7天尊重练习：把一个决定权真正交给孩子 / 进TA房间先敲门 / 欠TA的那句道歉认真说一次）"
      },
      {
        code: "B3",
        name: "双教练协同",
        module: "亲子（科目三）",
        items: [
          {
            id: "B3-1",
            text: "在孩子面前提起爱人时，你说TA的辛苦和好处多，还是抱怨和缺点多？",
            options: [
              { text: "说辛苦和好处多", value: 2 },
              { text: "好坏都说", value: 1 },
              { text: "忍不住抱怨居多", value: 0 }
            ],
            source: "原表题号 15 改写（一题双测：欣赏文化+防止把孩子拉进夫妻矛盾）",
            deduction: "当孩子面只播了差评"
          },
          {
            id: "B3-2",
            text: "一方在管教孩子时，另一方通常会怎么做？",
            options: [
              { text: "当场不插手，有意见私下说", value: 2 },
              { text: "有时忍不住当场护孩子", value: 1 },
              { text: "经常当着孩子唱反调", value: 0 }
            ],
            source: "新增（共同教养一致性：\"父母驾校\"的点题构面，原卷零题）",
            deduction: "双教练现场抢方向"
          },
          {
            id: "B3-3",
            text: "你们俩对孩子的教育有分歧时，通常怎么处理？",
            options: [
              { text: "私下聊，统一口径再面对孩子", value: 2 },
              { text: "当着孩子各说各的", value: 1 },
              { text: "谁强势听谁的，另一方憋着", value: 0 }
            ],
            source: "新增（教育分歧的处理方式，含隔代干预时是否一致对外）",
            deduction: "教育分歧靠音量定"
          },
          {
            id: "B3-4",
            text: "如果孩子撞见你们吵架，之后你们会让TA看到你们和好吗？",
            options: [
              { text: "会，让TA知道爸妈已经和好了", value: 2 },
              { text: "尽量不当TA面吵，但也从不解释", value: 1 },
              { text: "经常当TA面吵，吵完也不管", value: 0 }
            ],
            source: "新增（冲突暴露+修复示范：夫妻冲突暴露是孩子适应问题的头部预测项，衔接\"安全驾驶\"隐喻）",
            deduction: "吵完没让孩子看见和好",
            hazard: "当孩子面争吵且不和好"
          }
        ],
        insight_low: "父母驾校里最容易挂科的一门：两个教练互相拆台，学员只会学会钻空子。孩子要的不是完美的父母，是一致的父母、会和好的父母。",
        training_direction: "亲子（共同教养系列：一次教育分歧的私下对齐 / 一次当着孩子面的和好示范 / 约定\"管教时另一方不插话\"）"
      }
    ],
    plans: {
      A1: {
        name: "看见对方",
        kicker: "让爱被收到",
        description: "把还在心里的在意，变成对方今天能收到的小动作。",
        days: [
          dayOne,
          { day: 2, minutes: 2, title: "谢谢说具体", action: "告诉TA一件今天让你省心或安心的小事，并说清为什么。" },
          { day: 3, minutes: 1, title: "认真道一次别", action: "出门前看着TA说一声再见，回家时先给一句回应。" },
          { day: 4, minutes: 1, title: "主动靠近一点", action: "选一个自然的时刻，牵手、拥抱或靠近十秒。" },
          { day: 5, minutes: 3, title: "照顾一个细节", action: "留意TA今天最累的地方，主动接过一件小事。" },
          { day: 6, minutes: 5, title: "只听五分钟", action: "问问TA今天怎么样，五分钟里不看手机、不急着接话。" },
          { day: 7, minutes: 3, title: "把爱落成一句话", action: "说出这周你重新看见TA的一个具体瞬间。" }
        ]
      },
      A2: {
        name: "队友练习",
        kicker: "一起握方向",
        description: "把通知改成商量，把各自忙碌重新接回同一条路。",
        days: [
          dayOne,
          { day: 2, minutes: 4, title: "共同定一件小事", action: "挑一个本周安排，各说一个偏好，再一起定下来。" },
          { day: 3, minutes: 5, title: "对齐一笔支出", action: "选一笔近期支出，说清用途、顾虑和双方都能接受的做法。" },
          { day: 4, minutes: 3, title: "约一次二人时间", action: "在日历里写下一个不谈家务的二人时段，哪怕只有十分钟。" },
          { day: 5, minutes: 3, title: "问问TA想做什么", action: "问TA最近最想继续的一件爱好，只听，不评判。" },
          { day: 6, minutes: 5, title: "真的搭一次手", action: "为TA想做的事完成一个明确小步骤。" },
          { day: 7, minutes: 4, title: "开一次队友会", action: "互相说一句本周配合得好的地方，再约定下周一件共同决定。" }
        ]
      },
      A3: {
        name: "冲突修复",
        kicker: "先停，再接回来",
        description: "不练不吵架，练的是上头时先停下，冷静后把话重新说清。",
        days: [
          dayOne,
          { day: 2, minutes: 2, title: "约定暂停口令", action: "一起选一句暂停口令，约定听见后先停二十分钟。" },
          { day: 3, minutes: 3, title: "改写一句重话", action: "把一句“你总是”改成“当这件事发生，我希望……”。" },
          { day: 4, minutes: 5, title: "先听感受", action: "让TA说完一件烦心事，只复述感受，不急着给办法。" },
          { day: 5, minutes: 5, title: "二十四小时内复盘", action: "选最近一次小摩擦，各说事实、感受和下一次希望。" },
          { day: 6, minutes: 3, title: "补上一句道歉", action: "为自己那部分说一句不带“但是”的道歉。" },
          { day: 7, minutes: 4, title: "写下修复规则", action: "共同写下三条：不翻旧账、不冷战失联、事后要聊开。" }
        ]
      },
      B1: {
        name: "专注陪伴",
        kicker: "让在场真正在线",
        description: "时间不必很长，先让孩子在几分钟里确定：你真的在这里。",
        days: [
          dayOne,
          { day: 2, minutes: 5, title: "五分钟无手机", action: "把手机放到看不见的地方，跟着孩子做TA正在做的事。" },
          { day: 3, minutes: 2, title: "多问一个细节", action: "听孩子说一件事，多问一句“后来呢？”。" },
          { day: 4, minutes: 1, title: "给一个出门击掌", action: "出门或睡前，用击掌、拥抱或揉揉头做固定暗号。" },
          { day: 5, minutes: 2, title: "夸到具体一步", action: "只夸一个可见细节，说清TA哪一步做得认真。" },
          { day: 6, minutes: 5, title: "让孩子当导演", action: "五分钟里由孩子决定玩什么，你只跟随、不指导。" },
          { day: 7, minutes: 3, title: "记住一次分享", action: "写下孩子这周主动告诉你的一件小事，下次接着问。" }
        ]
      },
      B2: {
        name: "尊重练习",
        kicker: "把边界还给孩子",
        description: "权威不靠替TA做主，靠你尊重边界，也敢为自己的错负责。",
        days: [
          dayOne,
          { day: 2, minutes: 3, title: "交出一个决定权", action: "挑一件安全的小事，让孩子自己决定，你只提供信息。" },
          { day: 3, minutes: 1, title: "进门先敲门", action: "进入孩子的房间或动TA的东西前，先问一句可以吗。" },
          { day: 4, minutes: 5, title: "听完再回应", action: "孩子有情绪时，先说“我知道你现在很……”，等缓下来再谈事。" },
          { day: 5, minutes: 2, title: "认真补一句道歉", action: "想起一次错怪，明确说自己错在哪里，不用礼物代替。" },
          { day: 6, minutes: 3, title: "问意见，不替回答", action: "一件和孩子有关的事，先问TA怎么想，再说你的建议。" },
          { day: 7, minutes: 4, title: "做一次边界复盘", action: "和孩子互相说一件希望被尊重的小事，写下共同约定。" }
        ]
      },
      B3: {
        name: "双教练协同",
        kicker: "先对齐，再带路",
        description: "不求每次意见相同，只求分歧不拿孩子当现场，也让TA看见修复。",
        days: [
          dayOne,
          { day: 2, minutes: 3, title: "约定不当场拆台", action: "一起确认：一方管教时，另一方有意见留到私下说。" },
          { day: 3, minutes: 5, title: "私下对齐一件事", action: "挑一个教育分歧，各说底线，再定一句共同口径。" },
          { day: 4, minutes: 2, title: "当孩子面说一句好", action: "在孩子面前具体说出另一位家长今天的一份辛苦。" },
          { day: 5, minutes: 4, title: "补一次和好示范", action: "若孩子见过你们争执，告诉TA分歧已处理，也让TA看见正常说话。" },
          { day: 6, minutes: 3, title: "统一一个回答", action: "为孩子最近常问的一件事，先商量出一致且真实的回答。" },
          { day: 7, minutes: 5, title: "开一次教练小会", action: "各说一件想继续的做法和一件希望对方配合的事。" }
        ]
      }
    },
    grades: [
      {
        min: 85,
        name: "教练级",
        message: "这台车你开得很稳，还有余力带别人——把你的做法讲给另一半听，就是最好的家庭功课"
      },
      {
        min: 70,
        name: "老司机",
        message: "路况熟练，偶有小剐蹭——本次扣分项就是你的补练清单，挑一项这周练起来"
      },
      {
        min: 55,
        name: "实习期",
        message: "已经上路，几个路口还不太熟——每周专练一个扣分项，三个月后复检看进步（人人都从实习期开始，不丢人）"
      },
      {
        min: 0,
        name: "陪练期",
        message: "这段路先别一个人开——值得和家人认真聊一次这份结果，也可以引入外部支持（父母成长课程、家庭教育指导），把最弱的一科列为本月家庭功课优先项"
      }
    ],
    retest: [
      { when: "3 个月", name: "实习期考核" },
      { when: "6 个月", name: "转正复检" },
      { when: "每年", name: "幸福年审" },
      { when: "大事后", name: "换证体检" }
    ],
    stable_message: "复检分差小于 8 分，视为“保持稳定”。"
  });

  root.HAPPINESS_DRIVING_DATA = HAPPINESS_DRIVING_DATA;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = HAPPINESS_DRIVING_DATA;
  }
}(typeof globalThis !== "undefined" ? globalThis : this));
