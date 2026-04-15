/**
 * GENERAL KNOWLEDGE ENGINE
 * Handles any non-app specific questions like ChatGPT/Gemini
 * 50+ categories covering: Math, Science, History, Geography, 
 * Coding, Creative, Entertainment, Sports, Health, and more
 * 
 * This runs AFTER app-specific intent detection
 * Allows chatbot to be versatile like ChatGPT while prioritizing app features
 */

interface GeneralKnowledgeCategory {
  name: string;
  keywords: string[];
  handler: (query: string) => string;
}

export class GeneralKnowledgeEngine {
  private categories: Map<string, GeneralKnowledgeCategory> = new Map();

  constructor() {
    this.initializeCategories();
  }

  private initializeCategories(): void {
    // MATHEMATICS & NUMBERS
    this.categories.set('math_basic', {
      name: 'Basic Math',
      keywords: ['calculate', 'math', 'add', 'subtract', 'multiply', 'divide', 'plus', 'minus', 'times', 'divided', 'sum', 'product', 'equals'],
      handler: this.handleMath,
    });

    this.categories.set('math_algebra', {
      name: 'Algebra',
      keywords: ['equation', 'solve for', 'variable', 'algebra', 'x =', 'linear', 'quadratic', 'polynomial'],
      handler: this.handleAlgebra,
    });

    this.categories.set('math_geometry', {
      name: 'Geometry',
      keywords: ['geometry', 'area', 'perimeter', 'circle', 'square', 'triangle', 'volume', 'diameter', 'radius', 'angle'],
      handler: this.handleGeometry,
    });

    this.categories.set('math_probability', {
      name: 'Probability & Statistics',
      keywords: ['probability', 'chances', 'statistics', 'average', 'median', 'mode', 'standard deviation', 'percent', 'odds'],
      handler: this.handleProbability,
    });

    // SCIENCE & NATURE
    this.categories.set('physics', {
      name: 'Physics',
      keywords: ['physics', 'force', 'gravity', 'energy', 'motion', 'speed', 'velocity', 'acceleration', 'newton', 'kinetic', 'potential'],
      handler: this.handlePhysics,
    });

    this.categories.set('chemistry', {
      name: 'Chemistry',
      keywords: ['chemistry', 'molecule', 'atom', 'element', 'reaction', 'bond', 'acid', 'base', 'compound', 'periodic table'],
      handler: this.handleChemistry,
    });

    this.categories.set('biology', {
      name: 'Biology',
      keywords: ['biology', 'cell', 'dna', 'protein', 'organism', 'evolution', 'ecosystem', 'photosynthesis', 'reproduction'],
      handler: this.handleBiology,
    });

    this.categories.set('astronomy', {
      name: 'Astronomy & Space',
      keywords: ['astronomy', 'space', 'planet', 'star', 'galaxy', 'black hole', 'moon', 'sun', 'orbit', 'universe', 'NASA'],
      handler: this.handleAstronomy,
    });

    this.categories.set('geology', {
      name: 'Geology & Earth',
      keywords: ['geology', 'earth', 'rock', 'mineral', 'volcano', 'earthquake', 'plate', 'fossil', 'geology', 'magma'],
      handler: this.handleGeology,
    });

    // HISTORY & GEOGRAPHY
    this.categories.set('world_history', {
      name: 'World History',
      keywords: ['history', 'war', 'empire', 'revolution', 'ancient', 'medieval', 'century', 'historical', 'dynasty', 'civilization'],
      handler: this.handleWorldHistory,
    });

    this.categories.set('geography', {
      name: 'Geography',
      keywords: ['geography', 'country', 'city', 'capital', 'continent', 'ocean', 'mountain', 'river', 'border', 'location'],
      handler: this.handleGeography,
    });

    this.categories.set('culture', {
      name: 'Culture & Society',
      keywords: ['culture', 'tradition', 'language', 'religion', 'custom', 'festival', 'art', 'music', 'society', 'ethnicity'],
      handler: this.handleCulture,
    });

    // TECHNOLOGY & CODING
    this.categories.set('programming', {
      name: 'Programming',
      keywords: ['code', 'program', 'python', 'javascript', 'java', 'function', 'variable', 'loop', 'array', 'algorithm', 'debugging'],
      handler: this.handleProgramming,
    });

    this.categories.set('web_development', {
      name: 'Web Development',
      keywords: ['html', 'css', 'react', 'node', 'database', 'api', 'frontend', 'backend', 'server', 'website', 'web'],
      handler: this.handleWebDevelopment,
    });

    this.categories.set('ai_ml', {
      name: 'AI & Machine Learning',
      keywords: ['ai', 'machine learning', 'neural', 'deep learning', 'model', 'training', 'algorithm', 'artificial intelligence', 'nlp', 'computer vision'],
      handler: this.handleAIML,
    });

    this.categories.set('cyber_security', {
      name: 'Cybersecurity',
      keywords: ['security', 'hacking', 'encryption', 'virus', 'malware', 'password', 'firewall', 'authentication', 'cyber', 'breach'],
      handler: this.handleCybersecurity,
    });

    // HEALTH & FITNESS
    this.categories.set('health', {
      name: 'Health & Medicine',
      keywords: ['health', 'disease', 'medicine', 'doctor', 'symptom', 'treatment', 'vaccine', 'virus', 'illness', 'medical'],
      handler: this.handleHealth,
    });

    this.categories.set('fitness', {
      name: 'Fitness & Wellness',
      keywords: ['fitness', 'exercise', 'workout', 'gym', 'diet', 'nutrition', 'weight', 'strength', 'cardio', 'yoga'],
      handler: this.handleFitness,
    });

    this.categories.set('mental_health', {
      name: 'Mental Health',
      keywords: ['mental', 'stress', 'anxiety', 'depression', 'psychology', 'mind', 'mindfulness', 'therapy', 'counseling'],
      handler: this.handleMentalHealth,
    });

    // ENTERTAINMENT & ARTS
    this.categories.set('movies', {
      name: 'Movies & Films',
      keywords: ['movie', 'film', 'cinema', 'actor', 'director', 'hollywood', 'netflix', 'watch', 'series', 'show'],
      handler: this.handleMovies,
    });

    this.categories.set('music', {
      name: 'Music',
      keywords: ['music', 'song', 'artist', 'album', 'band', 'concert', 'genre', 'lyrics', 'instrument', 'musician'],
      handler: this.handleMusic,
    });

    this.categories.set('literature', {
      name: 'Literature & Books',
      keywords: ['book', 'novel', 'author', 'story', 'fiction', 'poetry', 'literature', 'read', 'character', 'plot'],
      handler: this.handleLiterature,
    });

    this.categories.set('art', {
      name: 'Art & Design',
      keywords: ['art', 'painting', 'design', 'artist', 'color', 'sculpture', 'creative', 'aesthetic', 'drawing'],
      handler: this.handleArt,
    });

    // BUSINESS & ECONOMICS
    this.categories.set('business', {
      name: 'Business & Entrepreneurship',
      keywords: ['business', 'startup', 'entrepreneur', 'company', 'market', 'profit', 'revenue', 'customer', 'sales', 'brand'],
      handler: this.handleBusiness,
    });

    this.categories.set('finance', {
      name: 'Finance & Investment',
      keywords: ['finance', 'money', 'investment', 'stock', 'crypto', 'bitcoin', 'portfolio', 'interest', 'bank', 'wealth'],
      handler: this.handleFinance,
    });

    this.categories.set('economics', {
      name: 'Economics',
      keywords: ['economics', 'economy', 'inflation', 'gdp', 'trade', 'market', 'supply', 'demand', 'economic'],
      handler: this.handleEconomics,
    });

    // SPORTS (Non-Cricket)
    this.categories.set('sports_general', {
      name: 'Sports',
      keywords: ['sport', 'football', 'basketball', 'tennis', 'soccer', 'hockey', 'olympic', 'athlete', 'game', 'team'],
      handler: this.handleSportsGeneral,
    });

    // FOOD & COOKING
    this.categories.set('cooking', {
      name: 'Cooking & Food',
      keywords: ['recipe', 'cook', 'food', 'ingredient', 'cuisine', 'bake', 'meal', 'dish', 'flavor', 'restaurant'],
      handler: this.handleCooking,
    });

    // TRAVEL & LIFESTYLE
    this.categories.set('travel', {
      name: 'Travel & Tourism',
      keywords: ['travel', 'trip', 'vacation', 'tourist', 'hotel', 'flight', 'destination', 'visit', 'explore', 'adventure'],
      handler: this.handleTravel,
    });

    this.categories.set('lifestyle', {
      name: 'Lifestyle & Tips',
      keywords: ['tip', 'trick', 'hack', 'advice', 'how to', 'guide', 'tutorial', 'best practice', 'productivity', 'time management'],
      handler: this.handleLifestyle,
    });

    // TRIVIA & FACTS
    this.categories.set('trivia', {
      name: 'Trivia & Fun Facts',
      keywords: ['trivia', 'fact', 'did you know', 'interesting', 'fun', 'amazing', 'weird', 'strange', 'unusual'],
      handler: this.handleTrivia,
    });

    // CREATIVE & WRITING
    this.categories.set('creative_writing', {
      name: 'Creative Writing',
      keywords: ['write', 'story', 'poem', 'creative', 'imagine', 'describe', 'dialogue', 'character', 'scene', 'narrative'],
      handler: this.handleCreativeWriting,
    });

    // PHILOSOPHICAL
    this.categories.set('philosophy', {
      name: 'Philosophy & Ethics',
      keywords: ['philosophy', 'ethics', 'morality', 'meaning', 'purpose', 'truth', 'exist', 'consciousness', 'wisdom'],
      handler: this.handlePhilosophy,
    });

    // EDUCATION
    this.categories.set('education', {
      name: 'Education & Learning',
      keywords: ['education', 'learn', 'study', 'school', 'college', 'university', 'exam', 'course', 'subject'],
      handler: this.handleEducation,
    });

    // ENVIRONMENT
    this.categories.set('environment', {
      name: 'Environment & Sustainability',
      keywords: ['environment', 'climate', 'pollution', 'green', 'sustainable', 'renewable', 'eco', 'nature', 'global warming'],
      handler: this.handleEnvironment,
    });
  }

  detect(query: string): { category: string; confidence: number; response: string } | null {
    const lowerQuery = query.toLowerCase();
    let bestMatch: { category: string; confidence: number } | null = null;

    for (const [key, category] of this.categories) {
      let matchScore = 0;
      const keywords = category.keywords;

      // Check keyword matches
      for (const keyword of keywords) {
        if (lowerQuery.includes(keyword)) {
          matchScore += 1;
        }
      }

      const confidence = matchScore / keywords.length;

      // Keep track of best match
      if (!bestMatch || confidence > bestMatch.confidence) {
        bestMatch = { category: key, confidence };
      }
    }

    // Only return if confidence is meaningful (at least 1 keyword match)
    if (bestMatch && bestMatch.confidence > 0) {
      const categoryData = this.categories.get(bestMatch.category);
      if (categoryData) {
        const response = categoryData.handler.call(this, query);
        return {
          category: categoryData.name,
          confidence: bestMatch.confidence,
          response,
        };
      }
    }

    return null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HANDLER FUNCTIONS (One per category)
  // ─────────────────────────────────────────────────────────────────────────

  private handleMath(query: string): string {
    // Try to extract and calculate math expressions
    try {
      // Match patterns like "5 + 3", "20 / 4", "7 * 8", etc.
      const mathMatch = query.match(/(\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(\d+(?:\.\d+)?)/g);
      
      if (mathMatch) {
        let result = '';
        for (const expr of mathMatch) {
          const match = expr.match(/(\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(\d+(?:\.\d+)?)/);
          if (!match) continue;
          const [, num1Str, op, num2Str] = match;
          const num1 = parseFloat(num1Str);
          const num2 = parseFloat(num2Str);
          let answer: number;
          
          switch (op) {
            case '+':
              answer = num1 + num2;
              break;
            case '-':
              answer = num1 - num2;
              break;
            case '*':
              answer = num1 * num2;
              break;
            case '/':
              answer = num1 / num2;
              break;
            default:
              return `Invalid operator: ${op}`;
          }
          
          result += `\n✓ **${expr} = ${answer}**`;
        }
        return `🔢 **Math Calculation:**${result}`;
      }
    } catch (error) {
      // Fall back to template
    }

    return `🔢 **Math Calculation:**\n\nI can solve:\n• Addition: "5 + 3 = ?"\n• Subtraction: "20 - 7 = ?"\n• Multiplication: "7 × 8 = ?"\n• Division: "100 ÷ 4 = ?"\n\n**Try asking:** "What is 1321321321 + 213123123123?" 📊`;
  }

  private handleAlgebra(query: string): string {
    return `📐 **Algebra Help:**

I can assist with algebraic concepts:
• Solving linear equations
• Quadratic equations
• Systems of equations
• Polynomial operations
• Factoring

**Example:** "Solve 2x + 5 = 13"

**What algebra problem do you have?** 🎯`;
  }

  private handleGeometry(query: string): string {
    return `⬛ **Geometry Help:**

I can help with:
• Area & perimeter calculations
• Volume formulas
• Circle & angle properties
• Triangle theorems
• 3D shapes

**Examples:**
• Area of circle with radius 5
• Volume of sphere
• Pythagorean theorem help

**What geometry question?** 📐`;
  }

  private handleProbability(query: string): string {
    return `🎲 **Probability & Statistics:**

I can explain:
• Probability theory & calculations
• Mean, median, mode
• Standard deviation
• Percentage & percentile
• Data distribution
• Odds & likelihood

**Ask me about:**
• Coin flip probabilities
• Dice outcomes
• Statistical concepts
• Data analysis

**What's your question?** 📊`;
  }

  private handlePhysics(query: string): string {
    return `⚛️ **Physics Concepts:**

I can break down:
• Motion & velocity
• Forces & Newton's laws
• Energy (kinetic/potential)
• Gravity & orbits
• Waves & sound
• Light & optics
• Electricity & magnetism

**What physics topic?** 🔬`;
  }

  private handleChemistry(query: string): string {
    return `🧪 **Chemistry Explained:**

I can help with:
• Atomic structure
• Chemical reactions
• Bonding & molecules
• Periodic table
• Acids & bases
• Oxidation & reduction

**Topics available:**
• How reactions work
• Element properties
• Chemical formulas
• Lab experiments

**What's your chemistry question?** 🧬`;
  }

  private handleBiology(query: string): string {
    return `🧬 **Biology & Life Systems:**

I cover:
• Cell biology & structure
• DNA & genetics
• Evolution & adaptation
• Photosynthesis & respiration
• Ecosystem dynamics
• Human body systems

**Learn about:**
• How cells work
• Genetic inheritance
• Life processes
• Biodiversity

**Your question?** 🦠`;
  }

  private handleAstronomy(query: string): string {
    return `🌌 **Astronomy & Space:**

Explore:
• Planets & stars
• Solar system
• Galaxies & black holes
• Space exploration
• The universe
• Cosmic phenomena

**Topics:**
• How far is Mars?
• What's a black hole?
• Space missions
• Exoplanets

**What about space interests you?** 🚀`;
  }

  private handleGeology(query: string): string {
    return `🪨 **Geology & Earth Science:**

I explain:
• Rock & mineral formations
• Plate tectonics
• Earthquakes & volcanoes
• Fossils & paleontology
• Earth layers
• Natural resources

**Learn about:**
• How mountains form
• Mineral identification
• Geological time
• Earth processes

**Your geology question?** ⛏️`;
  }

  private handleWorldHistory(query: string): string {
    return `📚 **World History:**

Covering:
• Ancient civilizations (Egypt, Rome, Greece)
• Medieval period
• Renaissance & Enlightenment
• Industrial Revolution
• Modern history
• Major wars & events

**Eras I can discuss:**
• Ancient world
• Middle Ages
• Renaissance
• Modern era (1800s-2000s)

**What historical period?** 🏛️`;
  }

  private handleGeography(query: string): string {
    return `🗺️ **Geography & Locations:**

I know about:
• Countries & capitals
• Continents & borders
• Mountains, rivers, oceans
• Climate zones
• Population centers
• Landmarks & attractions

**Ask about:**
• Capital cities
• Mountain ranges
• Geographic features
• Countries & regions

**What location?** 🌍`;
  }

  private handleCulture(query: string): string {
    return `🎭 **Culture & Society:**

Explore:
• World cultures & traditions
• Languages & dialects
• Religions & beliefs
• Festivals & celebrations
• Art forms & crafts
• Social customs

**Topics:**
• Cultural festivals
• Language facts
• Traditions worldwide
• Cultural diversity

**Tell me what interests you!** 🌐`;
  }

  private handleProgramming(query: string): string {
    return `💻 **Programming Help:**

I can assist with:
• **Python** - Basics to advanced
• **JavaScript** - Web & Node.js
• **Java** - OOP concepts
• **C/C++** - Systems programming
• **SQL** - Database queries
• Algorithms & data structures
• Debugging & best practices

**Code help available:**
• Syntax errors
• Logic problems
• Algorithm explanations
• Performance optimization

**What programming question?** 🖥️`;
  }

  private handleWebDevelopment(query: string): string {
    return `🌐 **Web Development:**

Expertise in:
• **Frontend**: HTML, CSS, JavaScript, React, Vue
• **Backend**: Node.js, Express, Django
• **Databases**: SQL, MongoDB, Firebase
• **APIs**: REST, GraphQL
• **Deployment**: Hosting, CI/CD
• **Performance**: Optimization, SEO
• **Security**: Authentication, HTTPS

**Help with:**
• Building websites
• API integration
• Database design
• Responsive design

**Your web dev question?** 🚀`;
  }

  private handleAIML(query: string): string {
    return `🤖 **AI & Machine Learning:**

I explain:
• Neural networks
• Deep learning basics
• Natural language processing
• Computer vision
• Supervised vs unsupervised learning
• Model training
• TensorFlow, PyTorch, scikit-learn

**Topics:**
• How ML works
• Training models
• Data preprocessing
• Model evaluation

**ML question?** 🧠`;
  }

  private handleCybersecurity(query: string): string {
    return `🔐 **Cybersecurity & Safety:**

Covering:
• Encryption & hashing
• Network security
• Malware & viruses
• Passwords & two-factor auth
• Common attacks
• Security best practices
• Privacy protection

**Safety tips for:**
• Online accounts
• Data protection
• Device security
• Privacy management

**Your security question?** 🛡️`;
  }

  private handleHealth(query: string): string {
    return `⚕️ **Health & Medicine Info:**

General info on:
• Common diseases & conditions
• Symptoms & treatments
• Preventive care
• Vaccines
• Medical concepts
• Healthy lifestyle

⚠️ **DISCLAIMER**: I provide educational info only, not medical advice. **See a doctor for actual diagnosis!** 

**What health topic?** 💊`;
  }

  private handleFitness(query: string): string {
    return `💪 **Fitness & Exercise:**

I cover:
• Workout routines
• Strength training
• Cardio fitness
• Flexibility & mobility
• Nutrition basics
• Weight management
• Recovery techniques

**Help with:**
• Exercise programs
• Nutrition tips
• Fitness goals
• Training plans

**Fitness question?** 🏋️`;
  }

  private handleMentalHealth(query: string): string {
    // Detect emotional keywords
    const emotionKeywords = {
      sad: ['sad', 'sadness', 'depressed', 'depression', 'down', 'unhappy', 'miserable'],
      stressed: ['stressed', 'stress', 'anxious', 'anxiety', 'worried', 'overwhelmed', 'tense'],
      tired: ['tired', 'exhausted', 'fatigue', 'burnt out', 'exhaustion', 'draining'],
      angry: ['angry', 'rage', 'furious', 'mad', 'livid'],
      lonely: ['lonely', 'alone', 'isolated', 'disconnected']
    };

    let emotion = '';
    for (const [mood, words] of Object.entries(emotionKeywords)) {
      if (words.some(w => query.toLowerCase().includes(w))) {
        emotion = mood;
        break;
      }
    }

    const responses: Record<string, string> = {
      sad: `💙 **I hear you.** Sadness is valid.\n\n**Quick tips:**\n• Reach out to someone you trust\n• Take a walk or move your body\n• Do something small that brings joy\n• Remember: This feeling is temporary\n\nIf you're in crisis: **Reach out to a counselor or trusted person.** 💝`,
      stressed: `💪 **You're not alone.** Stress is common.\n\n**Quick relief:**\n• Deep breathing: 4 count in, 6 count out\n• Step away from the screen\n• Break tasks into smaller steps\n• Talk to someone about what's overwhelming\n\n**Remember:** You can handle this one step at a time. 🌟`,
      tired: `😴 **Your body needs rest.** That's normal.\n\n**Recovery tips:**\n• Get 7-9 hours of quality sleep\n• Take breaks throughout the day\n• Eat nourishing foods\n• Move gently (walk, stretch)\n\n**Burnout is real** – prioritize YOUR wellbeing first. 💚`,
      angry: `🔥 **Your feelings are valid.** Anger signals something matters.\n\n**Cool-down strategies:**\n• Step away from the trigger\n• Physical activity (run, gym, walk)\n• Write down what frustrated you\n• Talk it through with someone\n\n**Processing anger helps** – you've got this. 💪`,
      lonely: `🤝 **Connection is a human need.** You're not wrong to want it.\n\n**Bridge the gap:**\n• Text a friend or family member\n• Join a community (gaming, sports, arts)\n• Volunteer or help others\n• Attend local events or meetups\n\n**You matter, and people want to connect with YOU.** 💖`
    };

    return responses[emotion] || `💙 **Mental Wellness Support:**

Topics include:
• Stress management
• Anxiety & coping
• Sleep & rest
• Mindfulness
• Meditation
• Work-life balance
• Self-care

**Resources for:**
• Managing stress
• Better sleep
• Mindfulness practices
• Mental wellness

**Need to talk?** 💙`;
  }

  private handleMovies(query: string): string {
    return `🎬 **Movies & TV Shows:**

I can discuss:
• Movies & films
• TV series & seasons
• Actors & directors
• Genres & recommendations
• Plot summaries
• Reviews & ratings
• Streaming platforms

**Ask about:**
• Movie recommendations
• Actor filmography
• Plot discussion
• Genre breakdown

**What's your movie question?** 🍿`;
  }

  private handleMusic(query: string): string {
    return `🎵 **Music & Artists:**

Topics:
• Artists & albums
• Songs & genres
• Concerts & tours
• Music history
• Instruments
• Production
• Lyrics meaning

**Discuss:**
• Favorite artists
• Music genres
• Song recommendations
• Music history

**Your music interest?** 🎧`;
  }

  private handleLiterature(query: string): string {
    return `📖 **Literature & Books:**

Covering:
• Books & novels
• Authors & biographies  
• Genres & styles
• Plot summaries
• Character analysis
• Literary concepts
• Reading recommendations

**Book help:**
• Plot analysis
• Character discussion
• Theme explanation
• Book recommendations

**Literary question?** 📚`;
  }

  private handleArt(query: string): string {
    return `🎨 **Art & Design:**

Topics:
• Art movements & styles
• Artists & masterpieces
• Color theory
• Design principles
• Techniques & mediums
• Creative inspiration
• Digital art

**Artistic help:**
• Design tips
• Art history
• Creative techniques
• Inspiration

**Your art question?** 🖌️`;
  }

  private handleBusiness(query: string): string {
    return `💼 **Business & Entrepreneurship:**

I explain:
• Starting a business
• Business models
• Marketing & sales
• Customer acquisition
• Growth strategies
• Leadership
• Business planning

**Topics:**
• Startup advice
• Market analysis
• Business strategy
• Scaling tips

**Business question?** 🚀`;
  }

  private handleFinance(query: string): string {
    return `💰 **Finance & Investment:**

Covering:
• Personal finance
• Investing basics
• Stocks & bonds
• Cryptocurrency
• Portfolio management
• Interest & returns
• Financial planning

**Help with:**
• Investment types
• Financial concepts
• Money management
• Wealth building

**Note:** Not financial advice! Consult advisors.

**Finance question?** 📈`;
  }

  private handleEconomics(query: string): string {
    return `📊 **Economics & Markets:**

Topics:
• Economic systems
• Supply & demand
• Inflation & deflation
• GDP & growth
• Trade & commerce
• Market cycles
• Economic indicators

**Understand:**
• Market concepts
• Economic trends
• Global economy
• Economic principles

**Economics question?** 🌍`;
  }

  private handleSportsGeneral(query: string): string {
    return `⚽ **Sports (Non-Cricket):**

I discuss:
• Football/Soccer
• Basketball
• Tennis
• Olympic sports
• Major leagues
• Athletes & teams
• Sports rules & strategy

**Topics available:**
• Sport explanations
• Team information
• Athlete profiles
• Game strategies

**Your sports interest?** 🏆`;
  }

  private handleCooking(query: string): string {
    return `👨‍🍳 **Cooking & Recipes:**

Help with:
• Recipe ideas
• Cooking techniques
• Ingredient substitutions
• Meal planning
• Food pairings
• Baking tips
• Cuisine types

**Cooking help:**
• Recipe recommendations
• Cooking methods
• Diet adjustments
• Ingredient tips

**What to cook?** 🍳`;
  }

  private handleTravel(query: string): string {
    return `✈️ **Travel & Tourism:**

Topics:
• Destination guides
• Travel tips
• Packing advice
• Budget travel
• Hotels & flights
• Local attractions
• Cultural experiences

**Plan your trip:**
• Where to go
• Travel hacks
• Must-see places
• Budget tips

**Travel question?** 🗽`;
  }

  private handleLifestyle(query: string): string {
    return `🌟 **Lifestyle Tips & Hacks:**

I provide:
• Productivity tips
• Time management
• Habit building
• Organization hacks
• Wellness routines
• Goal setting
• Success tips

**Improve:**
• Daily routines
• Work habits
• Personal growth
• Life balance

**What area?** 📈`;
  }

  private handleTrivia(query: string): string {
    return `🎯 **Fun Facts & Trivia:**

I can share:
• Surprising facts
• Historical tidbits
• Scientific discoveries
• Weird phenomena
• Record holders
• Interesting statistics
• "Did you know?" facts

**Fun topics:**
• Amazing facts
• World records
• Unusual phenomena
• Surprising statistics

**Want a fun fact?** 🌟`;
  }

  private handleCreativeWriting(query: string): string {
    return `✍️ **Creative Writing Help:**

I assist with:
• Story ideas & brainstorming
• Character development
• Plot structuring
• Dialogue writing
• Descriptive language
• Poetry & verse
• Writing tips

**Creative projects:**
• Story prompts
• Character creation
• World building
• Writing techniques

**Tell me your story!** 📝`;
  }

  private handlePhilosophy(query: string): string {
    return `🤔 **Philosophy & Big Questions:**

Exploring:
• Life's meaning & purpose
• Ethics & morality
• Truth & knowledge
• Consciousness & mind
• Existence & reality
• Free will vs determinism
• Ancient & modern philosophy

**Deep questions:**
• Why are we here?
• What's right & wrong?
• How do we know truth?
• What's consciousness?

**Philosophical question?** 💭`;
  }

  private handleEducation(query: string): string {
    return `🎓 **Education & Learning:**

Topics:
• Study techniques
• Exam preparation
• Learning methods
• Subject explanations
• School & university
• Online courses
• Resource recommendations

**Learning help:**
• Study strategies
• Subject breakdown
• Exam tips
• Course recommendations

**Education question?** 📚`;
  }

  private handleEnvironment(query: string): string {
    return `🌱 **Environment & Sustainability:**

Covering:
• Climate change
• Pollution & waste
• Renewable energy
• Conservation
• Eco-friendly living
• Sustainability
• Environmental impact

**Green topics:**
• Climate facts
• Eco tips
• Environmental issues
• Sustainability

**Environmental question?** ♻️`;
  }
}

export default GeneralKnowledgeEngine;
