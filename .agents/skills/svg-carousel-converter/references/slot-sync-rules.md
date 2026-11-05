# Regras de Sincronização de Slots e Checklist

## 1. O Padrão Obrigatório `propSlots`
Para que uma lâmina funcione tanto como template fixo quanto como lâmina avulsa no **Modo Personalizado** e no **Modo Aleatório**, ela **NUNCA** deve usar apenas IDs fixos e estáticos.

### Código Correto:
```tsx
export const Slide01T4: React.FC<SlideProps> = ({
  slotsData,
  activeSlotId,
  onSelectSlot,
  onUpdateAdjustments,
  onPickImage,
  isExport = false,
  slots: propSlots // <-- OBRIGATÓRIO: recebe slots dinâmicos injetados pelo CarouselStudio
}) => {
  // Faz o fallback para os IDs padrão se não houver propSlots
  const foto1Id = propSlots?.[0]?.id || 't4_s1_foto1';
  const foto2Id = propSlots?.[1]?.id || 't4_s1_foto2';

  const foto1 = slotsData[foto1Id] || { adjustments: { zoom: 100, x: 50, y: 50 } };
  const foto2 = slotsData[foto2Id] || { adjustments: { zoom: 100, x: 50, y: 50 } };

  return (
    <div className="w-full h-full relative bg-white overflow-hidden select-none">
      {/* ... containers com InteractivePhotoSlot usando foto1Id e foto2Id ... */}
    </div>
  );
};
```

---

## 2. Por que isso é Inegociável?
Quando o usuário cria um carrossel personalizado ou aleatório:
1. O estúdio clona a lâmina e atribui IDs únicos e dinâmicos para isolar fotos repetidas:
   `custom_slide_17300000_slot_0`, `custom_slide_17300000_slot_1`.
2. A barra de status no topo (`SlideSlotsChecklist`) lê a lista `slide.slots` com esses IDs dinâmicos.
3. Se a lâmina React usar IDs fixos (`t4_s1_foto1`), o upload do arquivo preenche a chave fixa no estado `slotsData`, mas o checklist verifica a chave dinâmica:
   - Os botões `[Foto 01]`, `[Foto 02]` no topo ficam permanentemente amarelos/laranjas.
   - Ao exportar, o validador encontra as chaves dinâmicas vazias e dispara o modal: *"Existem X fotos não carregadas no carrossel. Deseja exportar assim mesmo?"*.
4. Ao adotar `propSlots?.[index]?.id || 'default_id'`, os IDs ficam perfeitamente sincronizados em 100% dos fluxos.

---

## 3. Ordem de Z-Index e Seleção de Slot
- Cada container de foto deve possuir um manipulador de clique para seleção ativa do slot:
```tsx
onClick={(e) => {
  if (isExport) return;
  e.stopPropagation();
  onSelectSlot(slotId);
}}
```
- Em lâminas com fotos sobrepostas, garanta a hierarquia de camadas usando classes Tailwind (`z-10`, `z-20`, `z-30`) para que o clique selecione a foto que está visivelmente no topo.

