import { BugEncounter } from '../types/game';

export const OFFLINE_BUG_BANK: BugEncounter[] = [
  {
    id: 'bug-indent-01',
    title: 'INDENTATION ERROR! [LVL 12]',
    tier: 'common',
    level: 12,
    errorType: 'IndentationError',
    traceback: [
      'Traceback (most recent call last):',
      '  File "city_script.py", line 4, in <module>',
      '    def init_traffic():',
      'IndentationError: expected an indented block after function definition'
    ],
    glitchLine: '...   print("Traffic lights active") # !!! Indentation !!!',
    options: [
      {
        text: '[4 SPACES]',
        isCorrect: true,
        xp: 80,
        gold: 10,
        explanation: 'Correct! PEP 8 standard indentation requires 4 spaces inside code blocks.'
      },
      {
        text: '[TAB]',
        isCorrect: false,
        xp: 50,
        gold: 5,
        explanation: 'Mixing tabs and spaces causes TabError in modern Python.'
      },
      {
        text: '[PASS STATEMENT ONLY]',
        isCorrect: false,
        xp: 40,
        gold: 5,
        explanation: 'Putting only pass skips the intended print logic completely.'
      }
    ],
    aiHint: 'Remember consistency... In Python, indentation defines block scope. 4 spaces is the universal standard.',
    bugSpriteType: 'indentation'
  },
  {
    id: 'bug-syntax-colon',
    title: 'SYNTAX ERROR: MISSING COLON [LVL 10]',
    tier: 'common',
    level: 10,
    errorType: 'SyntaxError',
    traceback: [
      'Traceback (most recent call last):',
      '  File "arcade_score.py", line 8',
      '    if player_score > high_score',
      'SyntaxError: expected \':\''
    ],
    glitchLine: 'if player_score > high_score  # <-- Missing colon!',
    options: [
      {
        text: '[ADD COLON \':\']',
        isCorrect: true,
        xp: 75,
        gold: 12,
        explanation: 'Python header statements (if, for, while, def, class) must always end with a colon (:).'
      },
      {
        text: '[ADD SEMICOLON \';\']',
        isCorrect: false,
        xp: 30,
        gold: 5,
        explanation: 'Semicolons are statement separators, not compound statement block openers.'
      },
      {
        text: '[WRAP IN CURLY BRACES]',
        isCorrect: false,
        xp: 30,
        gold: 5,
        explanation: 'Python uses indentation blocks rather than curly braces {}.'
      }
    ],
    aiHint: 'Compound statements in Python always terminate header lines with a colon (:).',
    bugSpriteType: 'syntax'
  },
  {
    id: 'bug-type-str-int',
    title: 'TYPE ERROR: UNCONVERTED STR [LVL 11]',
    tier: 'common',
    level: 11,
    errorType: 'TypeError',
    traceback: [
      'Traceback (most recent call last):',
      '  File "gold_shop.py", line 15, in checkout',
      '    total = user_gold + "150"',
      'TypeError: unsupported operand type(s) for +: \'int\' and \'str\''
    ],
    glitchLine: 'total = user_gold + "150"  # Can not concatenate int and str',
    options: [
      {
        text: '[CAST TO INT(150)]',
        isCorrect: true,
        xp: 85,
        gold: 15,
        explanation: 'int("150") parses the numeric string so both operands are integers for arithmetic addition.'
      },
      {
        text: '[STR(user_gold) + "150"]',
        isCorrect: false,
        xp: 40,
        gold: 5,
        explanation: 'String concatenation will turn 50 + "150" into "50150" instead of mathematical addition!'
      },
      {
        text: '[USE EVAL("150")]',
        isCorrect: false,
        xp: 30,
        gold: 5,
        explanation: 'eval() is a dangerous anti-pattern prone to code injection vulnerabilities.'
      }
    ],
    aiHint: 'Python does not perform implicit string-to-number type coercion. Explicitly cast with int() or float().',
    bugSpriteType: 'syntax'
  },
  {
    id: 'bug-keyerror-dict',
    title: 'KEY ERROR: MISSING ATTRIBUTE [LVL 13]',
    tier: 'common',
    level: 13,
    errorType: 'KeyError',
    traceback: [
      'Traceback (most recent call last):',
      '  File "inventory.py", line 22, in equip',
      '    weapon = hero_items["laser_cannon"]',
      'KeyError: \'laser_cannon\''
    ],
    glitchLine: 'weapon = hero_items["laser_cannon"]  # Key not in dictionary',
    options: [
      {
        text: '[USE .GET("laser_cannon", None)]',
        isCorrect: true,
        xp: 90,
        gold: 15,
        explanation: 'dict.get(key, default) safely returns None without raising KeyError if the key is missing.'
      },
      {
        text: '[WRAP WITH TRY/PASS]',
        isCorrect: false,
        xp: 40,
        gold: 5,
        explanation: 'Silent exception swallowing leaves variable undefined and creates downstream bugs.'
      },
      {
        text: '[SET DEFAULT = 0 IN BRACKETS]',
        isCorrect: false,
        xp: 35,
        gold: 5,
        explanation: 'Square bracket indexing hero_items[key, default] is invalid dictionary syntax in Python.'
      }
    ],
    aiHint: 'Use dictionary.get() with fallback defaults or check "if key in dict:" before direct bracket access.',
    bugSpriteType: 'syntax'
  },
  {
    id: 'bug-indexerror-list',
    title: 'INDEX ERROR: OFF-BY-ONE [LVL 12]',
    tier: 'common',
    level: 12,
    errorType: 'IndexError',
    traceback: [
      'Traceback (most recent call last):',
      '  File "party_roster.py", line 12, in get_last_member',
      '    last_player = party[len(party)]',
      'IndexError: list index out of range'
    ],
    glitchLine: 'last_player = party[len(party)]  # Index out of bounds!',
    options: [
      {
        text: '[USE NEGATIVE INDEX party[-1]]',
        isCorrect: true,
        xp: 95,
        gold: 20,
        explanation: 'Python lists support negative indexing! party[-1] pythonically accesses the last element.'
      },
      {
        text: '[EXTEND LIST SIZE]',
        isCorrect: false,
        xp: 30,
        gold: 5,
        explanation: 'Resizing the list masks the logical off-by-one indexing error.'
      },
      {
        text: '[PARTY[LEN(PARTY) + 1]]',
        isCorrect: false,
        xp: 20,
        gold: 5,
        explanation: 'Adding 1 moves the pointer even further past list boundary!'
      }
    ],
    aiHint: 'Remember 0-based indexing: a list of length N has valid indexes from 0 to N-1. Use -1 for the last item!',
    bugSpriteType: 'syntax'
  },
  {
    id: 'bug-zerodivision',
    title: 'ZERO DIVISION EXCEPTION [LVL 14]',
    tier: 'common',
    level: 14,
    errorType: 'ZeroDivisionError',
    traceback: [
      'Traceback (most recent call last):',
      '  File "radar.py", line 40, in calc_density',
      '    density = total_bugs / active_sectors',
      'ZeroDivisionError: division by zero'
    ],
    glitchLine: 'density = total_bugs / active_sectors  # active_sectors is 0',
    options: [
      {
        text: '[GUARD IF active_sectors > 0]',
        isCorrect: true,
        xp: 90,
        gold: 15,
        explanation: 'Guard clause checking divisor != 0 returns 0 or default safely.'
      },
      {
        text: '[USE INTEGER DIVISION //]',
        isCorrect: false,
        xp: 35,
        gold: 5,
        explanation: 'Floor division // 0 still crashes immediately with ZeroDivisionError.'
      },
      {
        text: '[REPLACE WITH active_sectors = 0.0]',
        isCorrect: false,
        xp: 30,
        gold: 5,
        explanation: 'Dividing by floating-point 0.0 still throws ZeroDivisionError in Python.'
      }
    ],
    aiHint: 'Division by zero is undefined in mathematics and Python. Always validate or guard the denominator.',
    bugSpriteType: 'syntax'
  },
  {
    id: 'bug-name-error',
    title: 'NAME ERROR: UNBOUND VARIABLE [LVL 11]',
    tier: 'common',
    level: 11,
    errorType: 'NameError',
    traceback: [
      'Traceback (most recent call last):',
      '  File "player_move.py", line 18',
      '    current_speed = plater_velocity * 2',
      'NameError: name \'plater_velocity\' is not defined'
    ],
    glitchLine: 'current_speed = plater_velocity * 2  # Typo in player_velocity',
    options: [
      {
        text: '[FIX TYPO -> player_velocity]',
        isCorrect: true,
        xp: 80,
        gold: 12,
        explanation: 'Fixing the identifier typo binds the defined player_velocity variable correctly.'
      },
      {
        text: '[GLOBAL plater_velocity]',
        isCorrect: false,
        xp: 30,
        gold: 5,
        explanation: 'Declaring global does not create a value if the variable was never assigned.'
      },
      {
        text: '[WRAP WITH eval()]',
        isCorrect: false,
        xp: 25,
        gold: 5,
        explanation: 'eval() still looks up names in current scope and fails identically.'
      }
    ],
    aiHint: 'Typographical errors in variable identifiers are the #1 cause of NameErrors in rapid scripting.',
    bugSpriteType: 'syntax'
  },
  {
    id: 'bug-attribute-error',
    title: 'ATTRIBUTE ERROR: TUPLE IMMUTABLE [LVL 13]',
    tier: 'common',
    level: 13,
    errorType: 'AttributeError',
    traceback: [
      'Traceback (most recent call last):',
      '  File "city_coords.py", line 55',
      '    target_coord.append(100)',
      'AttributeError: \'tuple\' object has no attribute \'append\''
    ],
    glitchLine: 'target_coord = (10, 20); target_coord.append(100) # Tuples cannot append',
    options: [
      {
        text: '[CONVERT TO LIST [10, 20]]',
        isCorrect: true,
        xp: 95,
        gold: 18,
        explanation: 'Lists [] are mutable and support .append(); tuples () are immutable sequences.'
      },
      {
        text: '[USE target_coord.insert(0)]',
        isCorrect: false,
        xp: 35,
        gold: 5,
        explanation: 'Tuples have neither .append() nor .insert() methods.'
      },
      {
        text: '[REPLACE WITH target_coord += 100]',
        isCorrect: false,
        xp: 30,
        gold: 5,
        explanation: 'Cannot concatenate tuple with int; requires tuple concatenation like + (100,).'
      }
    ],
    aiHint: 'Tuples are immutable; if you need to mutate size or items dynamically, use a list [].',
    bugSpriteType: 'syntax'
  },
  {
    id: 'bug-miniboss-memory-leak',
    title: 'MINI-BOSS: MEMORY LEAK SLIME [LVL 16]',
    tier: 'miniboss',
    level: 16,
    errorType: 'MemoryLeak',
    traceback: [
      'WARNING: Memory utilization 99.4% in GlitchCity Core Engine',
      '  File "cache_daemon.py", line 104, in worker_loop',
      '    unbounded_cache.append(bytearray(1024 * 1024 * 10))',
      'MemoryError: Out of RAM in heap allocator'
    ],
    glitchLine: 'while True: unbounded_cache.append(packet) # No eviction or size cap!',
    options: [
      {
        text: '[USE LRU CACHE / COLLECTIONS.DEQUE(MAXLEN=1000)]',
        isCorrect: true,
        xp: 350,
        gold: 75,
        explanation: 'A bounded deque(maxlen=1000) or functools.lru_cache automatically discards old entries and bounds memory.'
      },
      {
        text: '[CALL GC.COLLECT() EVERY ITERATION]',
        isCorrect: false,
        xp: 90,
        gold: 15,
        explanation: 'Manual gc.collect() destroys CPU performance and cannot free references still held in unbounded_cache.'
      },
      {
        text: '[INCREASE SWAP SPACE FILE]',
        isCorrect: false,
        xp: 60,
        gold: 10,
        explanation: 'Expanding swap only postpones the crash and throttles disk I/O.'
      }
    ],
    aiHint: 'Memory leaks in Python usually stem from unbounded global lists or caches holding live references. Cap maximum size!',
    bugSpriteType: 'memory_leak'
  },
  {
    id: 'bug-miniboss-infinite-loop',
    title: 'MINI-BOSS: INFINITE LOOP SPECTER [LVL 18]',
    tier: 'miniboss',
    level: 18,
    errorType: 'InfiniteLoop',
    traceback: [
      'CRITICAL: CPU Core #1 pegged at 100% - Thread Hang Detected',
      '  File "pathfinder.py", line 82, in route_to_target',
      '    while current_node != destination:',
      'TimeoutError: Step limit 5,000,000 exceeded without progress'
    ],
    glitchLine: 'while i < 10: print(f"Processing {i}") # Missing i += 1 counter update!',
    options: [
      {
        text: '[ADD i += 1 INCREMENT]',
        isCorrect: true,
        xp: 380,
        gold: 80,
        explanation: 'Incrementing loop variable i guarantees reaching the termination condition i < 10.'
      },
      {
        text: '[CHANGE TO while True: break]',
        isCorrect: false,
        xp: 80,
        gold: 15,
        explanation: 'Breaking immediately will exit after 1 step without processing the remaining elements.'
      },
      {
        text: '[REPLACE i WITH GLOBAL]',
        isCorrect: false,
        xp: 70,
        gold: 10,
        explanation: 'Scope declaration does not advance the value of i.'
      }
    ],
    aiHint: 'Every while loop must mutate state towards its exit predicate, or use "for item in sequence:" instead.',
    bugSpriteType: 'infinite_loop'
  },
  {
    id: 'bug-boss-leviathan',
    title: 'WORLD BOSS: PRODUCTION OUTAGE LEVIATHAN [LVL 25]',
    tier: 'boss',
    level: 25,
    errorType: 'ProductionOutage',
    traceback: [
      '🔥🔥 EMERGENCY ALERT: 503 SERVICE UNAVAILABLE ACROSS ALL NODES 🔥🔥',
      'Traceback (most recent call last):',
      '  File "cluster_gateway.py", line 250, in handle_request',
      '    await db_pool.acquire(timeout=5.0)',
      'asyncio.exceptions.TimeoutError: ConnectionPool Exhausted (Active: 500, Waiting: 14,200)'
    ],
    glitchLine: 'conn = await db_pool.acquire(); await execute(); # Missing conn release in finally!',
    options: [
      {
        text: '[USE ASYNC WITH DB_POOL.ACQUIRE() AS CONN:]',
        isCorrect: true,
        xp: 1200,
        gold: 300,
        explanation: 'Context managers ensure connections are guaranteed returned to pool even if exceptions occur!'
      },
      {
        text: '[RESTART CLUSTER INSTANCES]',
        isCorrect: false,
        xp: 150,
        gold: 25,
        explanation: 'Band-aid reboot only cures symptoms for seconds before pool exhausts again.'
      },
      {
        text: '[RAISE POOL TIMEOUT TO 600 SECONDS]',
        isCorrect: false,
        xp: 120,
        gold: 20,
        explanation: 'Lengthening timeout creates cascading latency bottlenecks and thread starvation.'
      }
    ],
    aiHint: 'Resource leaks bring down production. Always wrap locks, connections, and files in context managers (with/async with)!',
    bugSpriteType: 'boss_leviathan'
  },
  {
    id: 'bug-recursion-error',
    title: 'RECURSION ERROR: STACK OVERFLOW [LVL 15]',
    tier: 'miniboss',
    level: 15,
    errorType: 'RecursionError',
    traceback: [
      'Traceback (most recent call last):',
      '  File "tree_search.py", line 33, in countdown',
      '    return countdown(n - 1)',
      'RecursionError: maximum recursion depth exceeded in comparison'
    ],
    glitchLine: 'def countdown(n): return countdown(n - 1)  # Missing base case: if n <= 0!',
    options: [
      {
        text: '[ADD BASE CASE if n <= 0: return]',
        isCorrect: true,
        xp: 320,
        gold: 65,
        explanation: 'Recursive functions require a termination base case to halt recursion.'
      },
      {
        text: '[SYS.SETRECURSIONLIMIT(999999)]',
        isCorrect: false,
        xp: 60,
        gold: 15,
        explanation: 'Inflating recursion limit causes hard segmentation fault when C-stack overflows.'
      },
      {
        text: '[REPLACE n - 1 WITH n - 2]',
        isCorrect: false,
        xp: 40,
        gold: 10,
        explanation: 'Skipping steps still lacks a stopping condition and blows the call stack.'
      }
    ],
    aiHint: 'All recursive functions require a base case that returns without calling itself.',
    bugSpriteType: 'infinite_loop'
  },
  {
    id: 'bug-mutable-default-arg',
    title: 'MUTABLE DEFAULT ARG TRAP [LVL 14]',
    tier: 'common',
    level: 14,
    errorType: 'LogicalError',
    traceback: [
      'LOGICAL BUG: Shared state leak detected between player sessions!',
      '  >>> player_a = add_item("potion")',
      '  >>> player_b = add_item("sword")',
      '  >>> player_b.items -> [\'potion\', \'sword\']  # Cross contamination!'
    ],
    glitchLine: 'def add_item(item, inventory=[]): inventory.append(item) # Mutable default list!',
    options: [
      {
        text: '[DEFAULT inventory=None; if None: inventory=[]]',
        isCorrect: true,
        xp: 110,
        gold: 25,
        explanation: 'Default argument expressions are evaluated once at function definition time, sharing state. Use None default!'
      },
      {
        text: '[USE inventory=list(inventory)]',
        isCorrect: false,
        xp: 40,
        gold: 10,
        explanation: 'Crashes on first invocation with NameError or infinite recursion.'
      },
      {
        text: '[REPLACE WITH inventory=tuple()]',
        isCorrect: false,
        xp: 30,
        gold: 5,
        explanation: 'Tuples cannot be appended to, which throws an AttributeError.'
      }
    ],
    aiHint: 'Never use mutable objects ([], {}) as default arguments in Python function definitions!',
    bugSpriteType: 'syntax'
  },
  {
    id: 'bug-list-modification-iteration',
    title: 'MODIFYING LIST DURING ITERATION [LVL 13]',
    tier: 'common',
    level: 13,
    errorType: 'RuntimeBehaviorError',
    traceback: [
      'Warning: Elements silently skipped during cleanup loop!',
      '  Original bugs: [bug1, bug2, bug3, bug4]',
      '  Processed bugs: [bug2, bug4]  # Skipped alternating elements!'
    ],
    glitchLine: 'for bug in active_bugs: active_bugs.remove(bug) # Modifying collection in-flight!',
    options: [
      {
        text: '[ITERATE OVER COPY active_bugs.copy() OR SLICE [:]]',
        isCorrect: true,
        xp: 100,
        gold: 20,
        explanation: 'Iterating over a shallow copy active_bugs[:] allows safe deletion from the original list without index shifting.'
      },
      {
        text: '[USE REVERSED(active_bugs) WITHOUT COPY]',
        isCorrect: false,
        xp: 45,
        gold: 10,
        explanation: 'Although reverse iteration can work with index deletions, list comprehension or copy is cleaner.'
      },
      {
        text: '[CALL active_bugs.clear() INSIDE FOR]',
        isCorrect: false,
        xp: 30,
        gold: 5,
        explanation: 'Wipes the entire list immediately on the first pass.'
      }
    ],
    aiHint: 'Never mutate a list while iterating directly over it; iterate over a copy or use a list comprehension.',
    bugSpriteType: 'syntax'
  }
];

export function getRandomFallbackBug(level: number, tier: 'common' | 'miniboss' | 'boss' = 'common'): BugEncounter {
  const matchingTiers = OFFLINE_BUG_BANK.filter(b => b.tier === tier);
  const pool = matchingTiers.length > 0 ? matchingTiers : OFFLINE_BUG_BANK;
  const chosen = pool[Math.floor(Math.random() * pool.length)];

  // Scale rewards slightly by level
  return {
    ...chosen,
    level,
    options: chosen.options.map(opt => ({
      ...opt,
      xp: Math.round(opt.xp * (1 + (level - 10) * 0.05)),
      gold: Math.round(opt.gold * (1 + (level - 10) * 0.04)),
    }))
  };
}
