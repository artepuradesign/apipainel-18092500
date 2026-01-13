import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "iPhone usado vale a pena?",
    answer: `Sim, entenda o porquê! Adquirir um iPhone seminovo pode ser uma excelente forma de obter um dispositivo de boa qualidade a um preço mais acessível. Na iPlace Seminovos, todos os dispositivos são verificados tecnicamente por nossa equipe de especialistas, garantindo qualidade e procedência.`,
  },
  {
    question: "Quanto vale o meu iPhone seminovo?",
    answer: `A condição física do seu iPhone desempenha um papel importante no valor. Telefones em excelente estado, com poucos sinais de desgaste e pleno funcionamento, geralmente têm um valor mais alto. Entre em contato conosco para uma avaliação personalizada.`,
  },
  {
    question: "O que é iPhone vitrine?",
    answer: `iPhone vitrine são aparelhos que ficaram em exposição nas lojas, mas nunca foram utilizados por clientes. Eles podem apresentar pequenos sinais de manuseio, mas funcionam perfeitamente e contam com garantia completa.`,
  },
  {
    question: "Qual a garantia dos produtos seminovos?",
    answer: `Todos os nossos produtos seminovos contam com 3 meses de garantia. Além disso, garantimos que a saúde da bateria é igual ou superior a 80%, proporcionando uma experiência de uso satisfatória.`,
  },
  {
    question: "Como funciona a entrega?",
    answer: `Realizamos entregas para todo o Brasil. O prazo e valor do frete variam de acordo com a região e são calculados no momento da compra. Você também pode optar por retirar seu produto em uma de nossas lojas físicas.`,
  },
];

const FAQ = () => {
  return (
    <section className="py-12 bg-secondary">
      <div className="container">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Seminovos | Perguntas Frequentes
        </h2>
        <Accordion type="single" collapsible className="w-full max-w-3xl">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
