import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Check, Waves, Brain, Music } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for trying out Speaker",
      features: [
        "3 voice clones",
        "Basic emotion controls",
        "720p export quality",
        "5 minutes per export",
        "Community support"
      ],
      cta: "Start Free",
      popular: false
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      description: "For content creators and professionals",
      features: [
        "Unlimited voice clones",
        "Advanced emotion controls",
        "4K export quality",
        "Unlimited export length",
        "Priority support",
        "Remove AI watermark",
        "Custom voice training",
        "API access"
      ],
      cta: "Get Started",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large teams and organizations",
      features: [
        "Everything in Pro",
        "Custom deployment",
        "Dedicated support",
        "SLA guarantee",
        "Advanced analytics",
        "Custom integrations"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="py-24 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-purple-500/20 rounded-full px-4 py-1 mb-6">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-200">The Future of AI Voice Technology</span>
            </div>
            <h1 className="text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500">
              Speaker
            </h1>
            <p className="text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Create emotionally intelligent AI voices that sound truly human. Clone, customize, and bring your voice to life.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={handleGetStarted}
              >
                Start Creating Now
              </Button>
              <Link to="/marketplace">
                <Button size="lg" variant="outline" className="border-purple-600 text-purple-400">
                  Explore Marketplace
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 py-20">
          <div className="bg-gray-800/50 p-8 rounded-xl backdrop-blur-sm">
            <div className="bg-purple-600/20 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
              <Brain className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Emotional Intelligence</h3>
            <p className="text-gray-400">
              Advanced AI that understands and replicates human emotions in voice, creating truly authentic expressions.
            </p>
          </div>

          <div className="bg-gray-800/50 p-8 rounded-xl backdrop-blur-sm">
            <div className="bg-blue-600/20 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
              <Waves className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Perfect Cloning</h3>
            <p className="text-gray-400">
              State-of-the-art voice cloning technology that captures every nuance of your unique voice signature.
            </p>
          </div>

          <div className="bg-gray-800/50 p-8 rounded-xl backdrop-blur-sm">
            <div className="bg-pink-600/20 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
              <Music className="w-7 h-7 text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Dynamic Control</h3>
            <p className="text-gray-400">
              Fine-tune pitch, speed, and emotions with our professional-grade timeline editor.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-purple-400 mb-2">99.9%</div>
            <div className="text-gray-400">Accuracy Rate</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-400 mb-2">50K+</div>
            <div className="text-gray-400">Active Users</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-pink-400 mb-2">1M+</div>
            <div className="text-gray-400">Voices Created</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-purple-400 mb-2">4.9/5</div>
            <div className="text-gray-400">User Rating</div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-400">Choose the perfect plan for your voice creation needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-gray-800/50 rounded-2xl backdrop-blur-sm p-8 ${
                  plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-gray-400">{plan.period}</span>}
                  </div>
                  <p className="text-gray-400 mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-400" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.popular ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={handleGetStarted}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center py-20">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Voice AI?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of creators using Speaker to bring their voices to life with true emotional intelligence.
          </p>
          <Button 
            size="lg" 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={handleGetStarted}
          >
            Get Started Now
          </Button>
        </div>
      </div>
    </div>
  );
}