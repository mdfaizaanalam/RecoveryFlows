/* LOCATION: frontend/src/components/AiAssistant.jsx */
/* ENHANCED VERSION - Fixed Send button + Better error handling + Context awareness */

import React, { useState, useRef, useEffect } from "react";
import {FaPaperPlane } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

import {
  getChatResponse,
  predictPaymentDefault,
  generateCustomerMessage,
} from "../utils/geminiAI";
import {
  MessageSquare,
  X,
  Bot,
  Loader2,
  Sparkles,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import "./AiAssistant.css";

const AiAssistant = ({ loanData, customerData, paymentHistory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hello! I'm your RecoveryFlow AI Assistant. 👋\n\nI can help you with:\n• Loan recovery strategies\n• Customer communication\n• Risk analysis\n• Payment predictions\n\nAsk me anything!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Auto-focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  // Generate contextual suggestions based on available data
  useEffect(() => {
    const contextualSuggestions = [];

    if (loanData && loanData.status === "approved") {
      contextualSuggestions.push("Analyze risk for this loan");
    }

    if (paymentHistory && paymentHistory.length > 0) {
      contextualSuggestions.push("Predict payment default risk");
    }

    if (customerData) {
      contextualSuggestions.push("Generate payment reminder");
    }

    contextualSuggestions.push(
      "Best recovery strategies",
      "How to handle late payments",
      "EMI restructuring options"
    );

    setSuggestions(contextualSuggestions);
  }, [loanData, customerData, paymentHistory]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setLoading(true);
    setShowSuggestions(false);

    try {
      // Check for specific commands
      let response;

      if (
        currentInput.toLowerCase().includes("analyze risk") ||
        currentInput.toLowerCase().includes("risk analysis")
      ) {
        if (loanData) {
          const { analyzeRecoveryRisk } = await import("../utils/geminiAI");
          const analysis = await analyzeRecoveryRisk(
            loanData,
            paymentHistory || []
          );
          response =
            `📊 **Risk Analysis Results:**\n\n` +
            `🎯 Recovery Score: ${analysis.riskScore}%\n` +
            `😊 Sentiment: ${analysis.sentiment}\n` +
            `💡 Strategy: ${analysis.strategy}`;
        } else {
          response =
            "⚠️ No loan data available for risk analysis. Please select a specific loan first.";
        }
      } else if (
        currentInput.toLowerCase().includes("predict default") ||
        currentInput.toLowerCase().includes("payment default")
      ) {
        if (loanData && paymentHistory) {
          const prediction = await predictPaymentDefault(
            loanData.id,
            paymentHistory,
            {
              latePayments: paymentHistory.filter((p) => p.status === "late")
                .length,
              missedPayments: paymentHistory.filter(
                (p) => p.status === "missed"
              ).length,
              responsiveness: "Good",
            }
          );
          response =
            `⚠️ **Default Risk Prediction:**\n\n` +
            `📍 Risk Level: ${prediction.defaultRisk.toUpperCase()}\n` +
            `📊 Probability: ${prediction.probability}%\n` +
            `⏰ Timeframe: ${prediction.timeframe}\n\n` +
            `**⚡ Warning Signs:**\n${prediction.warnings
              .map((w) => `• ${w}`)
              .join("\n")}\n\n` +
            `**✅ Preventive Actions:**\n${prediction.preventiveActions
              .map((a) => `• ${a}`)
              .join("\n")}`;
        } else {
          response =
            "⚠️ Insufficient data for default prediction. Need loan and payment history.";
        }
      } else if (
        currentInput.toLowerCase().includes("generate reminder") ||
        currentInput.toLowerCase().includes("payment reminder")
      ) {
        if (customerData && loanData) {
          response = await generateCustomerMessage("reminder", customerData, {
            amount: loanData.amount,
            emi: loanData.emi || "5000",
            dueDate: "upcoming",
            daysOverdue: 0,
          });
        } else {
          response =
            "⚠️ Need customer and loan data to generate payment reminder.";
        }
      } else {
        // Regular chat response with context
        const contextualMessages = [...messages, userMsg];

        // Add context about current loan if available
        if (loanData) {
          const contextMsg = {
            role: "user",
            text: `Context: Customer has a loan of €${loanData.amount} at ${loanData.interestRate}% interest. Status: ${loanData.status}.`,
          };
          contextualMessages.splice(1, 0, contextMsg);
        }

        response = await getChatResponse(contextualMessages, currentInput);
      }

      setMessages((prev) => [...prev, { role: "ai", text: response }]);
    } catch (error) {
      console.error("❌ AI Assistant Error:", error);
      let errorMessage =
        "I apologize, but I'm having trouble processing your request. ";

      if (error.message && error.message.includes("API key")) {
        errorMessage =
          "⚠️ I'm currently experiencing technical difficulties. Please check your API key configuration.\n\n" +
          "To fix this:\n" +
          "1. Create a .env file in frontend/\n" +
          "2. Add: VITE_GEMINI_API_KEY=your_api_key\n" +
          "3. Get your key from: https://makersuite.google.com/app/apikey";
      } else {
        errorMessage +=
          "Please try again or check if the AI service is properly configured.";
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
      // Re-focus input after sending
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    setShowSuggestions(false);
    // Focus input after selecting suggestion
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="ai-widget-container">
      {isOpen && (
        <div className="ai-chat-window">
          <div className="ai-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Bot size={22} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: "bold", fontSize: "1rem" }}>
                  RecoveryFlow AI
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    opacity: 0.95,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <CheckCircle size={10} />
                  Powered by Gemini
                </span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {loading && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.75rem",
                    background: "rgba(255,255,255,0.2)",
                    padding: "4px 10px",
                    borderRadius: "12px",
                  }}
                >
                  <Loader2 className="animate-spin" size={14} />
                  Thinking...
                </div>
              )}
              <X
                size={22}
                style={{ cursor: "pointer", transition: "transform 0.2s" }}
                onClick={() => setIsOpen(false)}
                onMouseEnter={(e) => (e.target.style.transform = "scale(1.15)")}
                onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
              />
            </div>
          </div>

          <div className="ai-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`ai-msg ${msg.role}`}>
                {msg.role === "ai" && (
                  <Bot
                    size={14}
                    style={{
                      marginRight: "6px",
                      display: "inline-block",
                      verticalAlign: "top",
                    }}
                  />
                )}
                <span style={{ whiteSpace: "pre-wrap" }}>{msg.text}</span>
              </div>
            ))}

            {loading && (
              <div
                className="ai-msg ai"
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <Loader2 className="animate-spin" size={16} />
                <span>Analyzing...</span>
              </div>
            )}

            {showSuggestions &&
              suggestions.length > 0 &&
              messages.length <= 1 && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "12px",
                    background:
                      "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                    borderRadius: "12px",
                    border: "1px solid #dee2e6",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#495057",
                      marginBottom: "10px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Sparkles size={14} color="#3b82f6" />
                    Quick Actions:
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {suggestions.slice(0, 4).map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        style={{
                          padding: "8px 12px",
                          background: "white",
                          border: "1px solid #dee2e6",
                          borderRadius: "8px",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.2s ease",
                          color: "#495057",
                          fontWeight: 500,
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "#e3f2fd";
                          e.target.style.borderColor = "#3b82f6";
                          e.target.style.transform = "translateX(6px)";
                          e.target.style.boxShadow =
                            "0 2px 8px rgba(59, 130, 246, 0.2)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "white";
                          e.target.style.borderColor = "#dee2e6";
                          e.target.style.transform = "translateX(0)";
                          e.target.style.boxShadow = "none";
                        }}
                      >
                        💡 {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="ai-input-area">
            <textarea
              ref={inputRef}
              className="ai-input"
              placeholder="Ask me anything about loan recovery..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              rows={1}
              style={{
                resize: "none",
                minHeight: "40px",
                maxHeight: "120px",
                overflow: "auto",
                color: "#1f2937",
                fontWeight: "500",
              }}
            />
            <button
              className="ai-send-btn"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              title={
                loading
                  ? "Processing..."
                  : !input.trim()
                  ? "Type a message"
                  : "Send message"
              }
            >
              {loading ? (
                <AiOutlineLoading3Quarters size={22} className="animate-spin" />
              ) : (
                <FaPaperPlane size={25} />
              )}
            </button>
          </div>

          {/* Context Indicator */}
          {loanData && (
            <div className="context-indicator">
              <AlertCircle size={12} />
              Context: Loan #{loanData.id} (€{loanData.amount})
            </div>
          )}
        </div>
      )}

      <button
        className="ai-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
        style={{
          animation: !isOpen ? "pulse 2s infinite" : "none",
        }}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
        {!isOpen && (
          <div
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              color: "white",
              borderRadius: "50%",
              width: "22px",
              height: "22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.65rem",
              fontWeight: "bold",
              border: "2px solid white",
              animation: "bounce 2s infinite",
              boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)",
            }}
          >
            AI
          </div>
        )}
      </button>
    </div>
  );
};

export default AiAssistant;
