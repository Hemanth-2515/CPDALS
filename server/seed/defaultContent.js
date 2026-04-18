export const defaultContent = [
  {
    title: "Introduction to Machine Learning",
    description: "Learn the foundations of machine learning, how models are trained, and how to evaluate them responsibly.",
    type: "text",
    difficultyLevel: "beginner",
    category: "Machine Learning",
    tags: ["Machine Learning", "fundamentals", "models"],
    estimatedDuration: 22,
    cognitiveLoadRating: 3,
    contentBody: `## What machine learning means

Machine learning is the practice of building systems that improve their behavior by learning patterns from data instead of relying only on fixed hand-written rules. A model receives examples, detects relationships inside those examples, and then uses those relationships to make predictions on new data.

## Why it matters

Machine learning matters because many modern problems are too complex to solve with static rules. Recommendation systems, fraud detection, computer vision, speech recognition, and medical risk analysis all involve patterns that are easier to learn from examples than to hard-code manually.

## Core workflow

1. Define the learning problem clearly.
2. Gather data that represents the task.
3. Clean, label, and prepare the data.
4. Split the data into training, validation, and test sets.
5. Train a model on the training data.
6. Tune the model using validation feedback.
7. Evaluate it on unseen test data.
8. Deploy, monitor, and retrain when needed.

## Main learning types

- **Supervised learning** uses labeled examples such as "spam" and "not spam".
- **Unsupervised learning** looks for structure without labels, such as clustering similar users.
- **Reinforcement learning** trains an agent through rewards and penalties over time.

## Key terms to remember

- **Feature**: an input variable used by the model.
- **Label**: the outcome we want to predict.
- **Model**: the mathematical mapping from inputs to outputs.
- **Inference**: using a trained model on new data.
- **Generalization**: performing well on unseen examples.
- **Overfitting**: learning the training data too closely, including noise.

## Choosing the right metric

Different tasks need different metrics. Accuracy can be useful, but it is not always enough. In imbalanced classification, precision and recall may matter more. In regression, you may prefer MAE or RMSE. A strong ML practitioner chooses metrics that match the actual goal instead of blindly chasing one number.

## Real-world concerns

Strong ML work is not only about accuracy. You also need reliable data quality, meaningful evaluation, checks for fairness, monitoring for drift, and a plan for handling failure. In most production systems, the data and monitoring pipeline matter as much as the algorithm itself.

### Related video resources

- https://www.youtube.com/watch?v=i_LwzRVP7bg
- https://www.youtube.com/watch?v=ukzFI9rgwfU`,
    orderIndex: 1
  },
  {
    title: "Machine Learning Foundations Video",
    description: "A topic-matched YouTube walkthrough covering the same ML basics, workflows, and evaluation ideas from the reading.",
    type: "video",
    difficultyLevel: "beginner",
    category: "Machine Learning",
    tags: ["Machine Learning", "video", "fundamentals"],
    estimatedDuration: 18,
    cognitiveLoadRating: 3,
    contentBody: "https://www.youtube.com/watch?v=ukzFI9rgwfU",
    orderIndex: 2
  },
  {
    title: "Python Basics for Data Science",
    description: "A practical Python tutorial for variables, loops, functions, arrays, and data-science workflows.",
    type: "video",
    difficultyLevel: "beginner",
    category: "Programming",
    tags: ["Programming", "python", "data science"],
    estimatedDuration: 20,
    cognitiveLoadRating: 4,
    contentBody: "https://www.youtube.com/watch?v=LHBE6Q9XlzI",
    orderIndex: 3
  },
  {
    title: "Machine Learning Fundamentals Quiz",
    description: "Test your understanding of core machine learning ideas, data splits, and model evaluation.",
    type: "quiz",
    difficultyLevel: "beginner",
    category: "Machine Learning",
    tags: ["AI & ML", "quiz", "machine learning"],
    estimatedDuration: 14,
    cognitiveLoadRating: 3,
    quizQuestions: [
      {
        question: "What type of learning uses labeled examples during training?",
        options: ["Unsupervised learning", "Supervised learning", "Reinforcement learning", "Evolutionary search"],
        correctAnswer: 1,
        explanation: "Supervised learning depends on labeled input-output examples."
      },
      {
        question: "Why do we keep a test set separate from training data?",
        options: ["To make training faster", "To increase model size", "To estimate generalization on unseen data", "To remove noisy features"],
        correctAnswer: 2,
        explanation: "A held-out test set checks whether the model performs well beyond the training data."
      },
      {
        question: "Which metric is commonly used for classification tasks?",
        options: ["Mean squared error only", "Accuracy", "R-squared only", "Euclidean distance"],
        correctAnswer: 1,
        explanation: "Accuracy is a common starting metric for classification, though precision and recall may also matter."
      },
      {
        question: "What is overfitting?",
        options: ["A model that learns training noise too closely", "A model with too little data storage", "A model that uses no features", "A model that always predicts the average"],
        correctAnswer: 0,
        explanation: "Overfitting happens when a model memorizes patterns that do not generalize well."
      },
      {
        question: "Which step is essential after deploying a model?",
        options: ["Monitoring data drift and failures", "Deleting the training data", "Removing the validation set", "Freezing all business requirements"],
        correctAnswer: 0,
        explanation: "Monitoring is required because production data and behavior change over time."
      }
    ],
    orderIndex: 4
  },
  {
    title: "Neural Networks Deep Dive",
    description: "Explore how neural networks transform inputs through layers, activations, and gradient-based learning.",
    type: "text",
    difficultyLevel: "intermediate",
    category: "Deep Learning",
    tags: ["Deep Learning", "neural networks", "backpropagation"],
    estimatedDuration: 30,
    cognitiveLoadRating: 6,
    contentBody: `## Neural networks in plain terms

A neural network is a stack of mathematical layers that gradually transforms raw input into a useful representation. Each layer applies weights, adds bias terms, and then passes the result through an activation function.

## Building blocks

- **Input layer** receives the original features.
- **Hidden layers** learn increasingly abstract patterns.
- **Output layer** maps learned signals to a prediction.
- **Weights and biases** are the trainable parameters.
- **Activation functions** such as ReLU introduce non-linearity so the model can learn complex relationships.

## Forward pass

During the forward pass, data moves from input to output. Every layer calculates a weighted combination of the previous layer and applies an activation function. The final layer produces probabilities, scores, or continuous values depending on the task.

## Loss and backpropagation

After prediction, the model compares its output with the correct answer using a **loss function**. Backpropagation computes how much each weight contributed to the error, and an optimizer such as gradient descent adjusts the weights to reduce that error over time.

## Why deeper networks help

Deeper networks can learn hierarchical features. In image tasks, early layers may detect edges, middle layers detect shapes, and later layers identify object parts. In text tasks, deeper layers can capture syntax, meaning, and long-range context.

## Practical limits

Deep networks require enough data, stable optimization, and regularization. Without those, they may overfit, train slowly, or become unstable. Techniques such as dropout, normalization, learning-rate schedules, and residual connections help training scale better.`,
    orderIndex: 5
  },
  {
    title: "Neural Network Architecture Video",
    description: "A visual YouTube explanation of layers, activations, gradients, and hidden representations.",
    type: "video",
    difficultyLevel: "intermediate",
    category: "Deep Learning",
    tags: ["Deep Learning", "video", "neural networks"],
    estimatedDuration: 12,
    cognitiveLoadRating: 5,
    contentBody: "https://www.youtube.com/watch?v=aircAruvnKk",
    orderIndex: 6
  },
  {
    title: "Data Preprocessing Techniques",
    description: "Learn how to clean, encode, scale, and validate data before training a model.",
    type: "text",
    difficultyLevel: "intermediate",
    category: "Data Science",
    tags: ["Data Science", "preprocessing", "feature engineering"],
    estimatedDuration: 22,
    cognitiveLoadRating: 5,
    contentBody: `## Why preprocessing matters

Models only learn from the data they receive. If the inputs are inconsistent, missing, biased, or badly scaled, performance suffers even when the algorithm is strong.

## Typical preprocessing tasks

- Handle missing values with deletion, imputation, or domain-specific defaults.
- Convert categorical values into model-friendly form using one-hot encoding, ordinal encoding, or target-aware strategies.
- Scale numerical features using normalization or standardization.
- Detect outliers and decide whether to cap, transform, or investigate them.
- Remove leakage by ensuring future information never appears in training features.

## Feature engineering

Feature engineering means creating better inputs from raw data. Examples include extracting day-of-week from timestamps, creating ratios, aggregating behavior over time, or reducing sparsity in text features.

## Pipeline thinking

Preprocessing should be repeatable. In production, you want the exact same transformations applied during training and inference. That is why many ML systems use pipelines so that each transformation is stored and replayed consistently.

## Common mistakes

- fitting preprocessing on the full dataset instead of training data only
- forgetting to apply the same transformations at inference time
- encoding categories differently between train and test data
- ignoring class imbalance or skewed targets

## Validation rule

Always fit preprocessing steps such as scaling or imputation on training data only, then apply them to validation and test data. Fitting on the whole dataset leaks information and inflates evaluation results.`,
    orderIndex: 7
  },
  {
    title: "Data Preprocessing Video",
    description: "A topic-specific YouTube lesson on cleaning, encoding, scaling, and building preprocessing pipelines.",
    type: "video",
    difficultyLevel: "intermediate",
    category: "Data Science",
    tags: ["Data Science", "video", "preprocessing"],
    estimatedDuration: 17,
    cognitiveLoadRating: 4,
    contentBody: "https://www.youtube.com/watch?v=bDhvCp3_lYw",
    orderIndex: 8
  },
  {
    title: "Advanced Deep Learning Quiz",
    description: "Challenge yourself with deeper questions on optimization, residual learning, and generalization.",
    type: "quiz",
    difficultyLevel: "advanced",
    category: "Deep Learning",
    tags: ["Deep Learning", "optimization", "quiz"],
    estimatedDuration: 18,
    cognitiveLoadRating: 7,
    quizQuestions: [
      {
        question: "Which problem do residual connections most directly help in deep networks?",
        options: ["Vanishing gradients", "Data imbalance", "Cold start recommendation", "Class encoding"],
        correctAnswer: 0,
        explanation: "Residual connections improve gradient flow and make very deep models easier to optimize."
      },
      {
        question: "What is dropout primarily used for?",
        options: ["Faster inference on CPUs", "Reducing overfitting", "Label smoothing only", "Feature scaling"],
        correctAnswer: 1,
        explanation: "Dropout randomly deactivates units during training to reduce co-adaptation and overfitting."
      },
      {
        question: "Why is batch normalization useful?",
        options: ["It compresses the dataset", "It replaces the loss function", "It stabilizes optimization and helps training speed", "It guarantees perfect accuracy"],
        correctAnswer: 2,
        explanation: "Batch normalization can make optimization more stable and allow higher learning rates."
      },
      {
        question: "Which optimizer adapts learning rates per parameter?",
        options: ["Adam", "Plain least squares", "K-means", "Apriori"],
        correctAnswer: 0,
        explanation: "Adam combines momentum-style updates with adaptive per-parameter learning rates."
      },
      {
        question: "Why do learning-rate schedules help during training?",
        options: ["They make every layer identical", "They let optimization become more precise over time", "They remove the need for validation", "They guarantee no overfitting"],
        correctAnswer: 1,
        explanation: "Schedules often reduce the learning rate over time so convergence becomes more stable."
      }
    ],
    orderIndex: 9
  },
  {
    title: "Machine Learning Crash Course",
    description: "A practical introduction to ML concepts, training loops, and real-world intuition.",
    type: "video",
    difficultyLevel: "beginner",
    category: "Machine Learning",
    tags: ["AI & ML", "overview", "machine learning"],
    estimatedDuration: 30,
    cognitiveLoadRating: 4,
    contentBody: "https://www.youtube.com/watch?v=i_LwzRVP7bg",
    orderIndex: 10
  },
  {
    title: "Deep Learning in 5 Minutes",
    description: "A short conceptual overview of neural networks, layers, and training.",
    type: "video",
    difficultyLevel: "beginner",
    category: "Deep Learning",
    tags: ["AI & ML", "deep learning", "overview"],
    estimatedDuration: 6,
    cognitiveLoadRating: 2,
    contentBody: "https://www.youtube.com/watch?v=aircAruvnKk",
    orderIndex: 11
  },
  {
    title: "Data Science Full Course for Beginners",
    description: "A longer walkthrough of statistics, wrangling, visualization, and basic modeling.",
    type: "video",
    difficultyLevel: "beginner",
    category: "Data Science",
    tags: ["Data Science", "beginners", "analytics"],
    estimatedDuration: 45,
    cognitiveLoadRating: 5,
    contentBody: "https://www.youtube.com/watch?v=dccdadl90vs",
    orderIndex: 12
  },
  {
    title: "Neural Networks from Scratch",
    description: "Implement forward pass, backpropagation, and parameter updates directly in Python.",
    type: "video",
    difficultyLevel: "intermediate",
    category: "Deep Learning",
    tags: ["AI & ML", "python", "neural networks"],
    estimatedDuration: 40,
    cognitiveLoadRating: 6,
    contentBody: "https://www.youtube.com/watch?v=Wo5dMEP_BbI",
    orderIndex: 13
  },
  {
    title: "Natural Language Processing with Python",
    description: "Hands-on NLP concepts including tokenization, embeddings, classification, and evaluation.",
    type: "video",
    difficultyLevel: "intermediate",
    category: "AI & ML",
    tags: ["AI & ML", "nlp", "python"],
    estimatedDuration: 35,
    cognitiveLoadRating: 6,
    contentBody: "https://www.youtube.com/watch?v=FLZvOKSCkxY",
    orderIndex: 14
  },
  {
    title: "Computer Vision with OpenCV",
    description: "Learn image processing, feature extraction, and detection workflows using OpenCV.",
    type: "video",
    difficultyLevel: "intermediate",
    category: "Data Science",
    tags: ["Data Science", "opencv", "computer vision"],
    estimatedDuration: 30,
    cognitiveLoadRating: 6,
    contentBody: "https://www.youtube.com/watch?v=oXlwWbU8l2o",
    orderIndex: 15
  },
  {
    title: "Reinforcement Learning Explained",
    description: "Understand agents, rewards, policies, exploration, and value-based learning.",
    type: "video",
    difficultyLevel: "advanced",
    category: "AI & ML",
    tags: ["AI & ML", "reinforcement learning", "agents"],
    estimatedDuration: 38,
    cognitiveLoadRating: 8,
    contentBody: "https://www.youtube.com/watch?v=98DCB98Gv8o",
    orderIndex: 16
  },
  {
    title: "Transformers and Attention Mechanism",
    description: "Understand self-attention, positional encoding, and why transformers scale well.",
    type: "video",
    difficultyLevel: "advanced",
    category: "Deep Learning",
    tags: ["AI & ML", "transformers", "attention"],
    estimatedDuration: 42,
    cognitiveLoadRating: 8,
    contentBody: "https://www.youtube.com/watch?v=acxqoltilME",
    orderIndex: 17
  },
  {
    title: "Understanding Bias and Variance in Machine Learning",
    description: "Study underfitting, overfitting, and how model complexity affects generalization.",
    type: "text",
    difficultyLevel: "intermediate",
    category: "Machine Learning",
    tags: ["Machine Learning", "statistics", "generalization"],
    estimatedDuration: 22,
    cognitiveLoadRating: 5,
    contentBody: `## The tradeoff

Bias and variance are two common sources of model error.

- **High bias** means the model is too simple and misses important structure.
- **High variance** means the model reacts too strongly to training noise and fails to generalize.

## Underfitting vs overfitting

An underfit model shows poor training and test performance. It has not learned enough signal. An overfit model looks strong on training data but weak on validation or test data because it memorized details that do not transfer.

## What changes the balance

- model complexity
- dataset size
- feature quality
- regularization strength
- noise in labels or inputs

## How to diagnose

If both training and validation scores are weak, suspect bias. If training is strong but validation is much worse, suspect variance.

## How to respond

- To reduce bias: use richer features, a stronger model, or longer training.
- To reduce variance: gather more data, regularize, simplify the model, or improve data quality.

## Practical intuition

Bias and variance are not abstract theory only. They explain why one model feels "too weak" and another feels "too brittle." A good learner should connect these ideas to actual choices such as model depth, features, augmentation, and data collection.

Good ML practice is about finding the simplest model that captures real structure without memorizing noise.`,
    orderIndex: 18
  },
  {
    title: "Bias and Variance Video",
    description: "A YouTube explanation focused on underfitting, overfitting, and generalization tradeoffs.",
    type: "video",
    difficultyLevel: "intermediate",
    category: "Machine Learning",
    tags: ["Machine Learning", "bias variance", "video"],
    estimatedDuration: 11,
    cognitiveLoadRating: 4,
    contentBody: "https://www.youtube.com/watch?v=EuBBz3bI-aA",
    orderIndex: 19
  },
  {
    title: "Introduction to Probability for Data Science",
    description: "Master the probability concepts that power uncertainty, inference, and statistical reasoning.",
    type: "text",
    difficultyLevel: "beginner",
    category: "Data Science",
    tags: ["Data Science", "probability", "statistics"],
    estimatedDuration: 26,
    cognitiveLoadRating: 4,
    contentBody: `## Why probability matters

Data science is full of uncertainty. Probability gives us a way to reason about events, risk, confidence, and expected outcomes.

## Core ideas

- **Experiment**: a process that produces outcomes.
- **Outcome**: one possible result.
- **Event**: a set of outcomes we care about.
- **Probability**: a value between 0 and 1 describing how likely an event is.

## Conditional probability

Conditional probability answers: what is the chance of event A given that event B has already happened? This matters in diagnosis, recommendation, fraud detection, and classification.

## Bayes' rule

Bayes' rule updates beliefs when new evidence appears:

\\[
P(A|B) = \\frac{P(B|A)P(A)}{P(B)}
\\]

This is a foundation for probabilistic inference and many practical decision systems.

## Random variables and distributions

A random variable maps outcomes to numbers. A probability distribution tells us how those values are spread. Common examples include Bernoulli, Binomial, Normal, and Poisson distributions.

## Expected value and variance

Expected value tells you the long-run average outcome. Variance tells you how spread out outcomes are around that average. These ideas appear constantly in data science, from risk modeling to A/B testing to model evaluation.

## In practice

Probability helps you estimate uncertainty, design experiments, interpret model outputs, and avoid overconfident decisions from limited data.`,
    orderIndex: 20
  },
  {
    title: "Probability for Data Science Video",
    description: "A visual YouTube introduction to probability, conditional events, Bayes' rule, and distributions.",
    type: "video",
    difficultyLevel: "beginner",
    category: "Data Science",
    tags: ["Data Science", "probability", "video"],
    estimatedDuration: 14,
    cognitiveLoadRating: 3,
    contentBody: "https://www.youtube.com/watch?v=HZGCoVF3YvM",
    orderIndex: 21
  },
  {
    title: "Deep Learning & Neural Networks Quiz",
    description: "Challenge yourself on architecture, activations, optimization, and representation learning.",
    type: "quiz",
    difficultyLevel: "intermediate",
    category: "Deep Learning",
    tags: ["Deep Learning", "quiz", "neural networks"],
    estimatedDuration: 14,
    cognitiveLoadRating: 6,
    quizQuestions: [
      {
        question: "Which activation function is widely used in modern hidden layers because it is simple and effective?",
        options: ["Sigmoid", "ReLU", "Step function", "Softmax"],
        correctAnswer: 1,
        explanation: "ReLU is commonly used in hidden layers because it is computationally simple and helps optimization."
      },
      {
        question: "What does backpropagation compute?",
        options: ["A random weight reset", "Gradients of the loss with respect to model parameters", "A new dataset split", "A clustering assignment"],
        correctAnswer: 1,
        explanation: "Backpropagation efficiently computes gradients so the optimizer can update weights."
      },
      {
        question: "Why are convolutional layers useful in vision tasks?",
        options: ["They remove the need for data", "They exploit local spatial structure", "They always prevent overfitting", "They replace labels"],
        correctAnswer: 1,
        explanation: "Convolutions capture local patterns such as edges and textures while sharing weights efficiently."
      },
      {
        question: "Which output activation is commonly used for multi-class classification?",
        options: ["Linear", "Softmax", "ReLU", "Leaky ReLU"],
        correctAnswer: 1,
        explanation: "Softmax converts class scores into a probability distribution across classes."
      },
      {
        question: "Why do hidden layers matter?",
        options: ["They learn richer intermediate representations", "They remove the need for data", "They replace gradient descent", "They guarantee low bias"],
        correctAnswer: 0,
        explanation: "Hidden layers help the model build useful internal features and abstractions."
      }
    ],
    orderIndex: 22
  }
];
